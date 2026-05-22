import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { ResourceSkeleton } from '../ui/Skeleton'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { ResourceCard } from './ResourceCard'
import { MotionSection, Reveal } from '../motion/MotionSection'
import { SpotlightCard } from '../motion/SpotlightCard'

const categories = ['', 'Diagnóstico', 'Redes', 'Programación', 'Mantenimiento', 'Seguridad', 'Plantillas']

export function LibrarySection({ resourcesState }) {
  const { resources, stats, filters, loading, updateFilters, downloadResource } = resourcesState

  return (
    <section id="library" className="section-shell py-14 sm:py-20">
      <MotionSection as="div">
        <Reveal className="mb-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">Dashboard de recursos</h2>
          <p className="mt-3 max-w-2xl text-slate-400">Busca, filtra y descarga contenido técnico aprobado por administradores.</p>
        </Reveal>

        <div className="mb-6 grid gap-4 min-[520px]:grid-cols-3">
          <Stat label="Recursos" value={stats.totalRecursos} />
          <Stat label="Descargas" value={stats.totalDescargas} />
          <Stat label="Usuarios" value={stats.totalUsuarios} />
        </div>

        <div className="glass mb-5 grid min-w-0 gap-3 rounded-[1.5rem] p-3 sm:rounded-[1.75rem] md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input className="field pl-11" value={filters.buscar} onChange={(e) => updateFilters({ buscar: e.target.value })} placeholder="Buscar recursos..." type="search" />
          </label>
          <select className="field" value={filters.orden} onChange={(e) => updateFilters({ orden: e.target.value })}>
            <option value="reciente">Más recientes</option>
            <option value="popular">Más descargados</option>
          </select>
        </div>

        <div className="no-scrollbar -mx-3 mb-8 flex gap-2 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <button
              key={category || 'Todos'}
              className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                filters.categoria === category ? 'border-violet/50 bg-violet/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              onClick={() => updateFilters({ categoria: category })}
            >
              {category || 'Todos'}
            </button>
          ))}
        </div>

        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, index) => <ResourceSkeleton key={index} />)}
          {!loading && resources.length === 0 && (
            <div className="glass col-span-full rounded-[1.5rem] p-8 text-center text-slate-300 sm:rounded-[1.75rem] sm:p-12">No se encontraron recursos.</div>
          )}
          <AnimatePresence mode="popLayout">
            {!loading && resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onDownload={downloadResource} />
            ))}
          </AnimatePresence>
        </div>
      </MotionSection>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <SpotlightCard className="p-4 sm:p-5">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <AnimatedCounter value={value || 0} className="mt-2 block text-3xl font-black text-white sm:text-4xl" />
    </SpotlightCard>
  )
}
