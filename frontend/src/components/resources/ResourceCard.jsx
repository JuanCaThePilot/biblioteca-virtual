import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { fileBadgeClass, formatDate, formatSize } from '../../utils/formatters'
import { Button } from '../ui/Button'

export function ResourceCard({ resource, onDownload }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -7, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-glass backdrop-blur-2xl"
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-gradient-to-br from-violet/15 via-transparent to-cyan/10" />
      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-[11px] font-black ring-1 ${fileBadgeClass(resource.archivo_tipo)}`}>
            {resource.archivo_tipo || 'FILE'}
          </span>
          <div>
            <h3 className="font-black leading-snug text-white">{resource.nombre}</h3>
            <p className="mt-1 text-xs text-slate-400">{resource.usuarios?.nombre || 'Anónimo'} · {formatDate(resource.created_at)}</p>
          </div>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm leading-6 text-slate-300">{resource.descripcion || 'Sin descripción.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(resource.tags || []).slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">{tag}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-400">{resource.descargas || 0} descargas · {formatSize(resource.archivo_tamaño)}</span>
          <Button className="btn-primary" onClick={() => onDownload(resource.id)}>
            <Download size={16} /> Descargar
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
