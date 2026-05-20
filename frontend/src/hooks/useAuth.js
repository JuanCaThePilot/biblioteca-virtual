// hooks/useAuth.js
// Hook personalizado para manejar autenticación: login, registro, perfil y recuperación de contraseña
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, apiPost } from '../services/api'

// Claves usadas en localStorage para persistir la sesión
const TOKEN_KEY = 'bv_token'
const USER_KEY = 'bv_user'
const AUTH_CHANNEL = 'bv_auth'
const ADMIN_ROLES = ['admin', 'superadmin']

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase()
}

function removeSensitiveStorage() {
  for (const storage of [localStorage, sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index)
      if (key?.startsWith('bv_')) storage.removeItem(key)
    }
  }
}

// Lee el usuario almacenado en localStorage, manejando errores de parseo
function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function useAuth() {
  // Estado principal: token JWT, datos del usuario, errores, loading
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readUser)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(() => !localStorage.getItem(TOKEN_KEY) || Boolean(readUser())) // Controla si ya se verificó la sesión
  const [sessionVersion, setSessionVersion] = useState(0)
  const initialCheckDone = useRef(false) // Evita que refreshProfile se ejecute más de una vez
  const channelRef = useRef(null)

  // Guarda el token y usuario en estado y localStorage
  const saveSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    setAuthError('')
    setSessionVersion((value) => value + 1)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  // Cierra la sesión: limpia estado y localStorage
  const logout = useCallback((options = {}) => {
    setToken(null)
    setUser(null)
    setAuthError('')
    setSessionVersion((value) => value + 1)
    removeSensitiveStorage()
    if (options.broadcast !== false) {
      channelRef.current?.postMessage({ type: 'logout' })
    }
  }, [])

  const clearAuthError = useCallback(() => setAuthError(''), [])

  // Refresca el perfil del usuario consultando el backend
  // Se ejecuta solo una vez al montar el componente
  const refreshProfile = useCallback(async () => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true
      setAuthInitialized(true)
    }

    if (!token) {
      return null
    }

    try {
      const data = await apiGet('/auth/perfil', token)
      setUser(data.usuario)
      localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
      return data.usuario
    } catch {
      logout()
      return null
    }
  }, [logout, token])

  // Ejecuta refreshProfile solo una vez al montar (array vacío de dependencias)
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return undefined
    const channel = new BroadcastChannel(AUTH_CHANNEL)
    channelRef.current = channel
    channel.onmessage = (event) => {
      if (event.data?.type === 'logout') logout({ broadcast: false })
    }
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [logout])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === TOKEN_KEY && event.newValue === null) logout({ broadcast: false })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [logout])

  // Inicia sesión con email y contraseña
  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/login', { email, password })
      saveSession(data.token, data.usuario)
      return data
    } catch (error) {
      setAuthError(error.message) // Muestra el mensaje de error del backend en pantalla
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [saveSession])

  // Registra un nuevo usuario
  const register = useCallback(async ({ nombre, email, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/register', { nombre, email, password })
      saveSession(data.token, data.usuario)
      return data
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [saveSession])

  // Solicita un token de recuperación de contraseña enviando el email
  const solicitarReset = useCallback(async (email) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/solicitar-reset', { email })
      return data
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [logout])

  // Confirma el restablecimiento con el token y la nueva contraseña
  const confirmarReset = useCallback(async (token, nueva_password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/confirmar-reset', { token, nueva_password })
      logout()
      return data
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [logout])

  // Memoriza el objeto retornado para evitar re-renderizados innecesarios
  const role = normalizeRole(user?.rol)

  return useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: ADMIN_ROLES.includes(role),
    isSuperAdmin: role === 'superadmin',
    authInitialized,
    sessionVersion,
    authError,
    authLoading,
    login,
    register,
    logout,
    clearAuthError,
    refreshProfile,
    solicitarReset,
    confirmarReset
  }), [authError, authInitialized, authLoading, clearAuthError, login, logout, refreshProfile, register, sessionVersion, solicitarReset, confirmarReset, token, user])
}
