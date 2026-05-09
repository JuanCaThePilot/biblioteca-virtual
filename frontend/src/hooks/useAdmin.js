import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPatch } from '../services/api'

export function useAdmin(token, isAdmin, refreshResources, refreshPublicStats) {
  const [adminStats, setAdminStats] = useState(null)
  const [pending, setPending] = useState([])
  const [published, setPublished] = useState([])
  const [users, setUsers] = useState([])
  const [loadingAdmin, setLoadingAdmin] = useState(false)

  useEffect(() => {
    if (token && isAdmin) return
    setAdminStats(null)
    setPending([])
    setPublished([])
    setUsers([])
    setLoadingAdmin(false)
  }, [isAdmin, token])

  const guard = useCallback(() => {
    if (!token || !isAdmin) throw new Error('Necesitas permisos de administrador.')
  }, [isAdmin, token])

  const fetchAdminStats = useCallback(async () => {
    guard()
    const data = await apiGet('/admin/estadisticas', token)
    setAdminStats(data)
    return data
  }, [guard, token])

  const fetchPending = useCallback(async () => {
    guard()
    const data = await apiGet('/admin/pendientes', token)
    setPending(data.pendientes || [])
    return data
  }, [guard, token])

  const fetchPublished = useCallback(async () => {
    guard()
    const data = await apiGet('/admin/recursos', token)
    setPublished(data.recursos || [])
    return data
  }, [guard, token])

  const fetchUsers = useCallback(async () => {
    guard()
    const data = await apiGet('/admin/usuarios', token)
    setUsers(data.usuarios || [])
    return data
  }, [guard, token])

  const approveResource = useCallback(async (id) => {
    guard()
    const data = await apiPatch(`/admin/recursos/${id}/aprobar`, {}, token)
    await Promise.all([fetchPending(), fetchPublished(), fetchAdminStats(), refreshResources(), refreshPublicStats()])
    return data
  }, [fetchAdminStats, fetchPending, fetchPublished, guard, refreshPublicStats, refreshResources, token])

  const rejectResource = useCallback(async (id) => {
    guard()
    const data = await apiDelete(`/admin/recursos/${id}/rechazar`, token)
    await Promise.all([fetchPending(), fetchAdminStats(), refreshResources(), refreshPublicStats()])
    return data
  }, [fetchAdminStats, fetchPending, guard, refreshPublicStats, refreshResources, token])

  const updateDescription = useCallback(async (id, descripcion) => {
    guard()
    const data = await apiPatch(`/admin/recursos/${id}/descripcion`, { descripcion }, token)
    await Promise.all([fetchPublished(), refreshResources()])
    return data
  }, [fetchPublished, guard, refreshResources, token])

  const deletePublished = useCallback(async (id) => {
    guard()
    const data = await apiDelete(`/admin/recursos/${id}`, token)
    await Promise.all([fetchPublished(), fetchAdminStats(), refreshResources(), refreshPublicStats()])
    return data
  }, [fetchAdminStats, fetchPublished, guard, refreshPublicStats, refreshResources, token])

  const toggleUserRole = useCallback(async (id, rolActual) => {
    guard()
    const rol = rolActual === 'admin' ? 'usuario' : 'admin'
    const data = await apiPatch(`/admin/usuarios/${id}/rol`, { rol }, token)
    await fetchUsers()
    return data
  }, [fetchUsers, guard, token])

  const loadSection = useCallback(async (section) => {
    setLoadingAdmin(true)
    try {
      if (section === 'estadisticas') return await fetchAdminStats()
      if (section === 'pendientes') return await fetchPending()
      if (section === 'recursos') return await fetchPublished()
      if (section === 'usuarios') return await fetchUsers()
      return null
    } finally {
      setLoadingAdmin(false)
    }
  }, [fetchAdminStats, fetchPending, fetchPublished, fetchUsers])

  return useMemo(() => ({
    adminStats,
    pending,
    published,
    users,
    loadingAdmin,
    loadSection,
    fetchAdminStats,
    fetchPending,
    fetchPublished,
    fetchUsers,
    approveResource,
    rejectResource,
    updateDescription,
    deletePublished,
    toggleUserRole
  }), [
    adminStats,
    approveResource,
    deletePublished,
    fetchAdminStats,
    fetchPending,
    fetchPublished,
    fetchUsers,
    loadSection,
    loadingAdmin,
    pending,
    published,
    rejectResource,
    toggleUserRole,
    updateDescription,
    users
  ])
}
