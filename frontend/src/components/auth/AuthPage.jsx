import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '../ui/Button'

export function AuthPage({ auth, onDone }) {
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ nombre: '', email: '', password: '' })

  async function submitLogin(event) {
    event.preventDefault()
    await auth.login(loginForm)
    onDone()
  }

  async function submitRegister(event) {
    event.preventDefault()
    await auth.register(registerForm)
    onDone()
  }

  return (
    <main className="section-shell grid min-h-screen place-items-center pt-28">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-[2rem] p-6">
        <div>
          <h1 className="text-3xl font-black text-white">BibliotecaTech</h1>
          <p className="mt-2 text-sm text-slate-400">Accede a recursos técnicos curados para ingeniería de sistemas.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
          {['login', 'register'].map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === item ? 'bg-gradient-to-r from-violet to-cyan text-white' : 'text-slate-400'}`}
              onClick={() => setTab(item)}
            >
              {item === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {auth.authError && <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-500/15 p-3 text-sm text-rose-100">{auth.authError}</div>}

        {tab === 'login' ? (
          <form className="mt-6 grid gap-4" onSubmit={submitLogin}>
            <label className="grid gap-2 text-sm text-slate-300">Email
              <input className="field" type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="tu@email.com" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Contraseña
              <input className="field" type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>{auth.authLoading ? 'Entrando...' : 'Entrar'}</Button>
          </form>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={submitRegister}>
            <label className="grid gap-2 text-sm text-slate-300">Nombre completo
              <input className="field" required value={registerForm.nombre} onChange={(e) => setRegisterForm({ ...registerForm, nombre: e.target.value })} placeholder="Tu nombre" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Email
              <input className="field" type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="tu@email.com" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Contraseña
              <input className="field" type="password" required minLength={6} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>{auth.authLoading ? 'Creando...' : 'Crear cuenta'}</Button>
          </form>
        )}
      </motion.div>
    </main>
  )
}
