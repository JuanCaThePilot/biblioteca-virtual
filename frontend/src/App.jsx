import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { AuthPage } from './components/auth/AuthPage'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { AmbientBackground } from './components/layout/AmbientBackground'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './components/landing/Hero'
import { LibrarySection } from './components/resources/LibrarySection'
import { UploadModal } from './components/resources/UploadModal'
import { useAdmin } from './hooks/useAdmin'
import { useAuth } from './hooks/useAuth'
import { useResources } from './hooks/useResources'
import { SpotlightCard } from './components/motion/SpotlightCard'
import { MotionSection, Reveal } from './components/motion/MotionSection'
import { pageTransition } from './utils/motion'

export default function App() {
  const [page, setPage] = useState('home')
  const [uploadOpen, setUploadOpen] = useState(false)
  const auth = useAuth()
  const resourcesState = useResources(auth.token)
  const admin = useAdmin(
    auth.token,
    auth.isAdmin,
    resourcesState.fetchResources,
    resourcesState.fetchPublicStats
  )

  useEffect(() => {
    if (page === 'admin' && auth.isAdmin) {
      admin.loadSection('estadisticas').catch(() => {})
    }
  }, [admin, auth.isAdmin, page])

  const screen = useMemo(() => {
    if (page === 'auth') return <AuthPage auth={auth} onDone={() => setPage('home')} />
    if (page === 'admin' && auth.isAdmin) return <AdminDashboard admin={admin} onBack={() => setPage('home')} />
    return (
      <main>
        <Hero
          stats={resourcesState.stats}
          onExplore={() => document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' })}
          onUpload={() => auth.isAuthenticated ? setUploadOpen(true) : setPage('auth')}
        />
        <BentoFeatures />
        <LibrarySection resourcesState={resourcesState} />
      </main>
    )
  }, [admin, auth, page, resourcesState])

  return (
    <div className="min-h-screen text-white">
      <AmbientBackground />
      <Navbar
        user={auth.user}
        isAuthenticated={auth.isAuthenticated}
        isAdmin={auth.isAdmin}
        page={page}
        onNavigate={setPage}
        onUpload={() => auth.isAuthenticated ? setUploadOpen(true) : setPage('auth')}
        onLogout={() => {
          auth.logout()
          setPage('home')
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div key={page} {...pageTransition}>
          {screen}
        </motion.div>
      </AnimatePresence>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} resourcesState={resourcesState} />
    </div>
  )
}

function BentoFeatures() {
  const items = [
    ['Moderación inteligente', 'Cada recurso subido pasa por aprobación administrativa antes de publicarse.', 'lg:col-span-2'],
    ['Storage integrado', 'Archivos en Supabase Storage con descarga controlada y contador automático.', ''],
    ['Roles seguros', 'Usuarios y administradores con permisos separados y verificación actualizada.', ''],
    ['Búsqueda rápida', 'Filtros por categoría, popularidad y texto para encontrar material técnico.', 'lg:col-span-2']
  ]

  return (
    <MotionSection className="section-shell py-12">
      <Reveal className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Plataforma SaaS académica</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black text-white sm:text-5xl">Un flujo moderno para publicar, revisar y descargar recursos.</h2>
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map(([title, text, span], index) => (
          <SpotlightCard
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.08 }}
            className={`min-h-48 p-6 ${span}`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet/30 to-cyan/10 blur-2xl" />
            <h3 className="relative text-xl font-black text-white">{title}</h3>
            <p className="relative mt-3 max-w-2xl text-sm leading-6 text-slate-400">{text}</p>
            <div className="relative mt-8 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                initial={{ width: '12%' }}
                whileInView={{ width: `${48 + index * 12}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 + index * 0.08 }}
              />
            </div>
          </SpotlightCard>
        ))}
      </div>
    </MotionSection>
  )
}
