// hooks/useAuth.js
// Hook personalizado para manejar autenticación: login, registro, perfil y recuperación de contraseña
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, apiPost } from '../services/api'

// Claves usadas en localStorage para persistir la sesión
const TOKEN_KEY = 'bv_token'
const USER_KEY = 'bv_user'

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
  const [authInitialized, setAuthInitialized] = useState(false) // Controla si ya se verificó la sesión
  const initialCheckDone = useRef(false) // Evita que refreshProfile se ejecute más de una vez

  // Guarda el token y usuario en estado y localStorage
  const saveSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  // Cierra la sesión: limpia estado y localStorage
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  // Refresca el perfil del usuario consultando el backend
  // Se ejecuta solo una vez al montar el componente
  const refreshProfile = useCallback(async () => {
    if (!token) {
      setAuthInitialized(true)
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
    } finally {
      if (!initialCheckDone.current) {
        initialCheckDone.current = true
        setAuthInitialized(true)
      }
    }
  }, [logout, token])

  // Ejecuta refreshProfile solo una vez al montar (array vacío de dependencias)
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  }, [])

  // Confirma el restablecimiento con el token y la nueva contraseña
  const confirmarReset = useCallback(async (token, nueva_password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/confirmar-reset', { token, nueva_password })
      return data
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // Memoriza el objeto retornado para evitar re-renderizados innecesarios
  return useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.rol === 'admin',
    authInitialized,
    authError,
    authLoading,
    login,
    register,
    logout,
    refreshProfile,
    solicitarReset,
    confirmarReset
  }), [authError, authInitialized, authLoading, login, logout, refreshProfile, register, solicitarReset, confirmarReset, token, user])
}