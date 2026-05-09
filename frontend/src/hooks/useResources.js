import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiGet, apiUpload } from '../services/api'

export function useResources(token) {
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState({ totalRecursos: 0, totalUsuarios: 0, totalDescargas: 0 })
  const [filters, setFilters] = useState({ buscar: '', categoria: '', orden: 'reciente' })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  const fetchResources = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    const params = new URLSearchParams({ orden: nextFilters.orden || 'reciente' })
    if (nextFilters.buscar) params.set('buscar', nextFilters.buscar)
    if (nextFilters.categoria) params.set('categoria', nextFilters.categoria)

    try {
      const data = await apiGet(`/recursos?${params.toString()}`)
      setResources(data.recursos || [])
      return data
    } finally {
      setLoading(false)
    }
  }, [filters])

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
