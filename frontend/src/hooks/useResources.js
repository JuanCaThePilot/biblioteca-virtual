import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, apiUpload } from '../services/api'

export function useResources(token) {
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState({ totalRecursos: 0, totalUsuarios: 0, totalDescargas: 0 })
  const [filters, setFilters] = useState({ buscar: '', categoria: '', orden: 'reciente' })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  // Use a ref to always have access to the latest filters without stale closures
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetchResources = useCallback(async (nextFilters) => {
    const currentFilters = nextFilters || filtersRef.current
    setLoading(true)
    const params = new URLSearchParams({ orden: currentFilters.orden || 'reciente' })
    if (currentFilters.buscar) params.set('buscar', currentFilters.buscar)
    if (currentFilters.categoria) params.set('categoria', currentFilters.categoria)

    try {
      const data = await apiGet(`/recursos?${params.toString()}`)
      setResources(data.recursos || [])
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPublicStats = useCallback(async () => {
    const data = await apiGet('/recursos/estadisticas')
    setStats(data)
    return data
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    fetchPublicStats().catch(() => {})
  }, [fetchPublicStats])

  const updateFilters = useCallback((patch) => {
    setFilters((current) => {
      const next = { ...current, ...patch }
      // Pass the new filters directly to avoid stale closure
      fetchResources(next).catch(() => {})
      return next
    })
  }, [fetchResources])

  const uploadResource = useCallback(async ({ nombre, descripcion, categoria, tags, archivo }) => {
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    try {
      const formData = new FormData()
      formData.append('nombre', nombre)
      formData.append('descripcion', descripcion)
      formData.append('categoria', categoria)
      formData.append('tags', tags || '')
      formData.append('archivo', archivo)

      const data = await apiUpload('/recursos', formData, token)
      setUploadSuccess(data.mensaje || 'Recurso enviado para revisión.')
      await fetchPublicStats()
      return data
    } catch (error) {
      setUploadError(error.message)
      throw error
    } finally {
      setUploading(false)
    }
  }, [fetchPublicStats, token])

  const downloadResource = useCallback(async (id) => {
    const data = await apiGet(`/recursos/${id}/descargar`)
    if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    await fetchResources()
    await fetchPublicStats()
    return data
  }, [fetchPublicStats, fetchResources])

  return useMemo(() => ({
    resources,
    stats,
    filters,
    loading,
    uploading,
    uploadError,
    uploadSuccess,
    setUploadError,
    setUploadSuccess,
    updateFilters,
    fetchResources,
    fetchPublicStats,
    uploadResource,
    downloadResource
  }), [
    downloadResource,
    fetchPublicStats,
    fetchResources,
    filters,
    loading,
    resources,
    stats,
    updateFilters,
    uploadError,
    uploadResource,
    uploadSuccess,
    uploading
  ])
}