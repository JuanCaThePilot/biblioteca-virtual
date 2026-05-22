import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { Button } from '../ui/Button'
import { Magnetic } from '../motion/Magnetic'
import { TiltCard } from '../motion/TiltCard'
import { fadeUp, slideRight, stagger } from '../../utils/motion'

const HologramScene = lazy(() => import('../three/HologramScene').then((module) => ({ default: module.HologramScene })))

export function Hero({ stats, onExplore, onUpload }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 700], [0, 90])
  const yDeep = useTransform(scrollY, [0, 700], [0, 150])
  const rotate = useTransform(scrollY, [0, 700], [0, -5])

  return (
    <section className="section-shell grid min-h-[100svh] items-center pb-14 pt-28 sm:pb-16 lg:pt-32">
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-12">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
          <motion.div variants={fadeUp} className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-bold leading-5 text-slate-200 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.8)]" />
            Plataforma técnica conectada a Supabase
          </motion.div>
          <motion.h1 variants={fadeUp} className="mt-6 max-w-4xl bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-4xl font-black leading-[0.98] tracking-tight text-transparent sm:text-6xl lg:text-7xl xl:text-8xl">
            Biblioteca virtual para recursos técnicos premium.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
            Centraliza scripts, instaladores, manuales y plantillas con autenticación, moderación administrativa, búsqueda avanzada y descargas desde Storage.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:flex sm:flex-row">
            <Magnetic className="min-w-0">
              <Button className="btn-primary min-h-12 w-full px-5 text-sm sm:min-h-14 sm:w-auto sm:px-6 sm:text-base" onClick={onExplore}>
                Explorar recursos <ArrowRight className="transition group-hover:translate-x-1" size={18} />
              </Button>
            </Magnetic>
            <Magnetic className="min-w-0">
              <Button className="min-h-12 w-full px-5 text-sm sm:min-h-14 sm:w-auto sm:px-6 sm:text-base" onClick={onUpload}>
                <UploadCloud size={18} /> Subir recurso
              </Button>
            </Magnetic>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3 text-sm text-slate-300">
            {['JWT Auth', 'Panel admin', 'Storage público', 'Aprobación editorial'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">{item}</span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={slideRight} initial="hidden" animate="visible" style={{ y, rotate }} className="relative min-h-[390px] min-w-0 sm:min-h-[500px] lg:min-h-[560px]">
          <motion.div style={{ y: yDeep }} className="absolute inset-x-4 top-2 h-80 rounded-full bg-cyan/10 blur-3xl sm:inset-x-8 sm:h-[30rem]" />
          <Suspense fallback={<div className="absolute inset-8 rounded-full bg-violet/10 blur-3xl" />}>
            <HologramScene />
          </Suspense>
          <TiltCard className="relative z-10">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass relative overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-transparent to-cyan/10" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
                <span className="ml-auto text-xs font-semibold text-slate-400">Dashboard Preview</span>
              </div>
              <div className="grid gap-3 min-[420px]:grid-cols-3">
                <Metric label="Recursos" value={stats.totalRecursos} />
                <Metric label="Descargas" value={stats.totalDescargas} />
                <Metric label="Usuarios" value={stats.totalUsuarios} />
              </div>
              <div className="mt-4 grid gap-3">
                <PreviewItem icon={<Sparkles size={18} />} title="Recursos curados" text="Contenido aprobado por administradores." />
                <PreviewItem icon={<ShieldCheck size={18} />} title="Moderación segura" text="Roles, edición y eliminación desde panel admin." />
                <PreviewItem icon={<UploadCloud size={18} />} title="Uploads completos" text="PDF, ZIP, RAR, EXE, scripts y más." />
              </div>
            </div>
          </motion.div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-slate-950/55 p-3 sm:p-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <AnimatedCounter value={value || 0} className="mt-2 block text-2xl font-black text-white sm:text-3xl" />
    </div>
  )
}

function PreviewItem({ icon, title, text }) {
  return (
    <motion.div whileHover={{ x: 4 }} className="flex min-w-0 items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-3 sm:p-4">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet/25 to-cyan/15 text-cyan-100 ring-1 ring-white/10">{icon}</span>
      <div className="min-w-0">
        <strong className="text-sm text-white">{title}</strong>
        <p className="text-xs text-slate-400">{text}</p>
      </div>
    </motion.div>
  )
}
