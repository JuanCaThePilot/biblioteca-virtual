const RENDER_API = 'https://biblioteca-virtual-l4cu.onrender.com/api'

export function getApiBase() {
  const envApi = import.meta.env.VITE_API_URL
  if (envApi) return envApi.replace(/\/$/, '')

  const { hostname, port, protocol, origin } = window.location
  if (port === '3000') return '/api'
  if (hostname === 'localhost' || hostname === '127.0.0.1') return RENDER_API
  if (protocol.startsWith('http')) return `${origin}/api`
  return RENDER_API
}

export const API = getApiBase()

async function parseJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }
  return data
}

export async function apiGet(path, token) {
  const response = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
  return parseJson(response)
}

export async function apiPost(path, body, token) {
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  return parseJson(response)
}

export async function apiPatch(path, body, token) {
  const response = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  return parseJson(response)
}

export async function apiDelete(path, token) {
  const response = await fetch(`${API}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
  return parseJson(response)
}

export async function apiUpload(path, formData, token) {
  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  })
  return parseJson(response)
}
