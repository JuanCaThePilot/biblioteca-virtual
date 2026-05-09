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
        <motion.div key={page} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
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
    <section className="section-shell py-12">
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map(([title, text, span], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className={`glass relative overflow-hidden rounded-[2rem] p-6 ${span}`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet/30 to-cyan/10 blur-2xl" />
            <h3 className="relative text-xl font-black text-white">{title}</h3>
            <p className="relative mt-3 max-w-2xl text-sm leading-6 text-slate-400">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
