import { motion } from 'framer-motion'
import { LayoutDashboard, LogIn, LogOut, Upload, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

export function Navbar({ user, isAuthenticated, isAdmin, onNavigate, onUpload, onLogout, page }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const firstName = user?.nombre?.split(' ')[0] || 'Usuario'
  const initials = user?.nombre
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U'

  const desktopActions = (
    <>
      {isAdmin && (
        <Button className={`gap-2 ${page === 'admin' ? 'bg-white/15' : ''}`} onClick={() => onNavigate('admin')}>
          <LayoutDashboard size={16} /> Panel Admin
        </Button>
      )}
      {isAuthenticated && (
        <Button className="btn-primary gap-2" onClick={onUpload}>
          <Upload size={16} /> Subir recurso
        </Button>
      )}
      {!isAuthenticated ? (
        <Button className="btn-primary gap-2" onClick={() => onNavigate('auth')}>
          <LogIn size={16} /> Iniciar sesión
        </Button>
      ) : (
        <Button className="btn-danger gap-2" onClick={onLogout}>
          <LogOut size={16} /> Salir
        </Button>
      )}
    </>
  )

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed left-1/2 top-3 z-40 w-[min(1180px,calc(100%-24px))] -translate-x-1/2 rounded-[1.5rem] border px-4 py-3 backdrop-blur-2xl transition ${
        scrolled ? 'border-white/15 bg-slate-950/82 shadow-glass' : 'border-white/10 bg-slate-950/55'
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => onNavigate('home')}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan font-black shadow-glow">B</span>
          <span className="hidden min-w-0 min-[390px]:block">
            <strong className="block text-sm font-black text-white">BibliotecaTech</strong>
            <small className="hidden text-xs text-slate-400 sm:block">Ingeniería de Sistemas</small>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          {user && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">Hola, {firstName}</span>}
          {desktopActions}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 lg:hidden sm:gap-2">
          {!isAuthenticated ? (
            <Button className="btn-primary gap-2 px-3 text-xs sm:px-4 sm:text-sm" onClick={() => onNavigate('auth')}>
              <LogIn size={15} className="shrink-0" />
              <span className="whitespace-nowrap">Iniciar sesión</span>
            </Button>
          ) : (
            <>
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-xs font-black text-white shadow-glass sm:hidden"
                title={firstName}
                aria-label={`Perfil de ${firstName}`}
              >
                {initials}
              </span>
              <span className="hidden max-w-32 items-center gap-2 truncate rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 sm:inline-flex">
                <UserRound size={14} className="shrink-0 text-cyan" />
                <span className="truncate">{firstName}</span>
              </span>
              {isAdmin && (
                <Button
                  className={`h-10 w-10 px-0 ${page === 'admin' ? 'bg-white/15' : ''}`}
                  onClick={() => onNavigate('admin')}
                  aria-label="Abrir panel de administración"
                  title="Panel Admin"
                >
                  <LayoutDashboard size={16} />
                </Button>
              )}
              <Button className="btn-primary h-10 w-10 px-0" onClick={onUpload} aria-label="Subir recurso" title="Subir recurso">
                <Upload size={16} />
              </Button>
              <Button className="btn-danger h-10 w-10 px-0" onClick={onLogout} aria-label="Cerrar sesión" title="Salir">
                <LogOut size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
