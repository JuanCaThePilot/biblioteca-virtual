// components/auth/AuthPage.jsx
// Página de autenticación con tabs de login, registro y recuperación de contraseña
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '../ui/Button'

/*
 * Estados de la vista:
 * - 'login'       : formulario de inicio de sesión
 * - 'register'    : formulario de registro
 * - 'reset-email' : formulario para solicitar token de recuperación
 * - 'reset-pass'  : formulario para ingresar token y nueva contraseña
 */

export function AuthPage({ auth, onDone }) {
  // view controla qué formulario se muestra: login | register | reset-email | reset-pass
  const [view, setView] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ nombre: '', email: '', password: '' })
  const [resetEmail, setResetEmail] = useState('')          // Email para solicitar reset
  const [resetToken, setResetToken] = useState('')            // Token recibido del backend
  const [resetPassword, setResetPassword] = useState('')      // Nueva contraseña
  const [resetStep, setResetStep] = useState('email')         // 'email' → 'token' → 'done'
  const [resetMessage, setResetMessage] = useState('')        // Mensaje de éxito/error del reset

  // Cambia entre tabs de login/register limpiando el error de autenticación
  function switchView(newView) {
    setView(newView)
    // Limpia el error al cambiar de vista para que no se acumulen mensajes viejos
    auth.authError = ''
    // Si volvemos a login, limpia el mensaje de reset también
    if (newView === 'login') {
      setResetStep('email')
      setResetMessage('')
    }
  }

  // ─── LOGIN ───────────────────────────────────────────────────────
  async function submitLogin(event) {
    event.preventDefault()
    await auth.login(loginForm)
    // Si login fue exitoso (no lanzó error), redirige al home
    if (!auth.authError) onDone()
  }

  // ─── REGISTER ────────────────────────────────────────────────────
  async function submitRegister(event) {
    event.preventDefault()
    await auth.register(registerForm)
    if (!auth.authError) onDone()
  }

  // ─── SOLICITAR TOKEN DE RESET ────────────────────────────────────
  async function handleSolicitarReset(event) {
    event.preventDefault()
    setResetMessage('')
    try {
      const data = await auth.solicitarReset(resetEmail)
      // Si el backend devuelve un reset_token, pasamos al paso de ingreso de token
      if (data.reset_token) {
        setResetToken(data.reset_token) // Guardamos el token para facilitar el desarrollo
        setResetStep('token')
      }
      setResetMessage(data.mensaje || 'Revisa tu correo para continuar.')
    } catch (error) {
      setResetMessage(error.message || 'Error al solicitar restablecimiento.')
    }
  }

  // ─── CONFIRMAR RESET CON TOKEN ──────────────────────────────────
  async function handleConfirmarReset(event) {
    event.preventDefault()
    setResetMessage('')
    if (!resetToken || resetPassword.length < 6) {
      setResetMessage('La contraseña debe tener mínimo 6 caracteres.')
      return
    }
    try {
      const data = await auth.confirmarReset(resetToken, resetPassword)
      setResetMessage(data.mensaje || 'Contraseña actualizada.')
      setResetStep('done')
    } catch (error) {
      setResetMessage(error.message || 'Error al restablecer la contraseña.')
    }
  }

  return (
    <main className="section-shell grid min-h-screen place-items-center pt-28">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-[2rem] p-6">
        <div>
          <h1 className="text-3xl font-black text-white">BibliotecaTech</h1>
          <p className="mt-2 text-sm text-slate-400">
            {view === 'login' ? 'Accede a recursos técnicos curados para ingeniería de sistemas.' :
             view === 'register' ? 'Crea tu cuenta y comienza a compartir recursos.' :
             'Recupera el acceso a tu cuenta.'}
          </p>
        </div>

        {/* Tabs: solo se muestran en login/register, no en reset */}
        {view !== 'reset-email' && view !== 'reset-pass' && (
          <div className="mt-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
            {['login', 'register'].map((item) => (
              <button
                key={item}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  view === item ? 'bg-gradient-to-r from-violet to-cyan text-white' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => switchView(item)}
              >
                {item === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>
        )}

        {/* Errores de autenticación (login/register) */}
        {auth.authError && (view === 'login' || view === 'register') && (
          <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-500/15 p-3 text-sm text-rose-100 font-medium">
            {auth.authError}
          </div>
        )}

        {/* Mensajes del proceso de reset */}
        {resetMessage && (view === 'reset-email' || view === 'reset-pass') && (
          <div className={`mt-5 rounded-2xl border p-3 text-sm font-medium ${
            resetStep === 'done'
              ? 'border-emerald-300/20 bg-emerald-500/15 text-emerald-100'
              : 'border-cyan-300/20 bg-cyan-500/15 text-cyan-100'
          }`}>
            {resetMessage}
            {resetStep === 'done' && (
              <button className="ml-2 underline" onClick={() => switchView('login')}>
                Iniciar sesión
              </button>
            )}
          </div>
        )}

        {/* ─── LOGIN FORM ───────────────────────────────── */}
        {view === 'login' && (
          <form className="mt-6 grid gap-4" onSubmit={submitLogin}>
            <label className="grid gap-2 text-sm text-slate-300">Email
              <input className="field" type="email" required value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="tu@email.com" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Contraseña
              <input className="field" type="password" required value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>
              {auth.authLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            {/* Enlace para recuperación de contraseña */}
            <button type="button" className="text-xs text-slate-500 hover:text-cyan transition mt-1 underline"
              onClick={() => switchView('reset-email')}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {/* ─── REGISTER FORM ────────────────────────────── */}
        {view === 'register' && (
          <form className="mt-6 grid gap-4" onSubmit={submitRegister}>
            <label className="grid gap-2 text-sm text-slate-300">Nombre completo
              <input className="field" required value={registerForm.nombre}
                onChange={(e) => setRegisterForm({ ...registerForm, nombre: e.target.value })}
                placeholder="Tu nombre" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Email
              <input className="field" type="email" required value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="tu@email.com" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Contraseña
              <input className="field" type="password" required minLength={6} value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>
              {auth.authLoading ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </form>
        )}

        {/* ─── SOLICITAR RESET (ingresar email) ─────────── */}
        {view === 'reset-email' && resetStep === 'email' && (
          <form className="mt-6 grid gap-4" onSubmit={handleSolicitarReset}>
            <p className="text-sm text-slate-400">Ingresa tu email registrado y te enviaremos un token para restablecer tu contraseña.</p>
            <label className="grid gap-2 text-sm text-slate-300">Email
              <input className="field" type="email" required value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="tu@email.com" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>
              {auth.authLoading ? 'Enviando...' : 'Enviar token'}
            </Button>
            <button type="button" className="text-xs text-slate-500 hover:text-white transition mt-1 underline"
              onClick={() => switchView('login')}>
              Volver a inicio de sesión
            </button>
          </form>
        )}

        {/* ─── CONFIRMAR RESET (ingresar token + nueva pass) ─── */}
        {view === 'reset-email' && resetStep === 'token' && (
          <form className="mt-6 grid gap-4" onSubmit={handleConfirmarReset}>
            <p className="text-sm text-slate-400">Ingresa el token que recibiste y tu nueva contraseña.</p>
            <label className="grid gap-2 text-sm text-slate-300">Token de recuperación
              <input className="field" required value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Token de 64 caracteres" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">Nueva contraseña
              <input className="field" type="password" required minLength={6} value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" />
            </label>
            <Button className="btn-primary mt-2 w-full" disabled={auth.authLoading}>
              {auth.authLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>
            <button type="button" className="text-xs text-slate-500 hover:text-white transition mt-1 underline"
              onClick={() => switchView('login')}>
              Volver a inicio de sesión
            </button>
          </form>
        )}

        {/* Enlace rápido desde login/register a recuperación */}
        {view === 'login' && (
          <p className="mt-4 text-center text-xs text-slate-500">
            ¿No tienes cuenta?{' '}
            <button className="text-cyan hover:underline" onClick={() => switchView('register')}>
              Regístrate gratis
            </button>
          </p>
        )}
        {view === 'register' && (
          <p className="mt-4 text-center text-xs text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button className="text-cyan hover:underline" onClick={() => switchView('login')}>
              Inicia sesión
            </button>
          </p>
        )}
      </motion.div>
    </main>
  )
}