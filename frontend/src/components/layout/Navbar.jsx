import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, LogIn, LogOut, Menu, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

export function Navbar({ user, isAuthenticated, isAdmin, onNavigate, onUpload, onLogout, page }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const actions = (
    <>
      {isAdmin && (
        <Button className={page === 'admin' ? 'bg-white/15' : ''} onClick={() => onNavigate('admin')}>
          <LayoutDashboard size={16} /> Panel Admin
        </Button>
      )}
      {isAuthenticated && (
        <Button className="btn-primary" onClick={onUpload}>
          <Upload size={16} /> Subir recurso
        </Button>
      )}
      {!isAuthenticated ? (
        <Button onClick={() => onNavigate('auth')}>
          <LogIn size={16} /> Iniciar sesión
        </Button>
      ) : (
        <Button className="btn-danger" onClick={onLogout}>
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
      <div className="flex items-center justify-between gap-3">
        <button className="flex items-center gap-3 text-left" onClick={() => onNavigate('home')}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan shadow-glow">B</span>
          <span>
            <strong className="block text-sm font-black text-white">BibliotecaTech</strong>
            <small className="hidden text-xs text-slate-400 sm:block">Ingeniería de Sistemas</small>
          </span>
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          {user && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">Hola, {user.nombre?.split(' ')[0]}</span>}
          {actions}
        </div>

        <button className="rounded-full border border-white/10 p-2 text-white lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
              {user && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">Hola, {user.nombre?.split(' ')[0]}</span>}
              {actions}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
