export function formatDate(value) {
  if (!value) return '--'
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function formatSize(bytes) {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function fileBadgeClass(type) {
  const key = String(type || '').toUpperCase()
  const map = {
    PDF: 'from-rose-400/25 to-rose-500/10 text-rose-100 ring-rose-300/20',
    EXE: 'from-rose-400/25 to-red-500/10 text-rose-100 ring-rose-300/20',
    PY: 'from-emerald-400/25 to-emerald-500/10 text-emerald-100 ring-emerald-300/20',
    DOCX: 'from-cyan-400/25 to-blue-500/10 text-cyan-100 ring-cyan-300/20',
    ZIP: 'from-amber-400/25 to-orange-500/10 text-amber-100 ring-amber-300/20',
    RAR: 'from-violet-400/25 to-fuchsia-500/10 text-violet-100 ring-violet-300/20',
    SQL: 'from-pink-400/25 to-violet-500/10 text-pink-100 ring-pink-300/20',
    BAT: 'from-slate-300/20 to-slate-500/10 text-slate-100 ring-white/10'
  }
  return map[key] || 'from-white/15 to-white/5 text-white ring-white/10'
}
