import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../services/api'

const TOKEN_KEY = 'bv_token'
const USER_KEY = 'bv_user'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readUser)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const saveSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) return null
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

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await apiPost('/auth/login', { email, password })
      saveSession(data.token, data.usuario)
      return data
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [saveSession])

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

  return useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.rol === 'admin',
    authError,
    authLoading,
    login,
    register,
    logout,
    refreshProfile
  }), [authError, authLoading, login, logout, refreshProfile, register, token, user])
}
