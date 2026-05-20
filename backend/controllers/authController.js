const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { sendPasswordResetEmail } = require('../services/emailService');

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 30;
const GENERIC_RESET_MESSAGE = 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.';
const resetRequestLimits = new Map();
const resetConfirmLimits = new Map();

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim();
}

function enforceRateLimit(store, key, { limit, windowMs }) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= limit;
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('base64url');
  return { token, tokenHash: hashResetToken(token) };
}

function buildResetUrl(req, token) {
  const configuredUrl = process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL;
  const fallbackUrl = `${req.protocol}://${req.get('host')}`;
  const baseUrl = new URL(configuredUrl || fallbackUrl);
  baseUrl.search = '';
  baseUrl.hash = '';
  baseUrl.pathname = '/';
  baseUrl.searchParams.set('reset_token', token);
  return baseUrl.toString();
}

function isStrongPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password);
}

function signUserToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      role: normalizeRole(usuario.rol),
      nombre: usuario.nombre,
      tokenVersion: usuario.token_version || 0
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function isMissingTokenVersionColumn(error) {
  return error?.code === '42703' && error?.message?.includes('token_version');
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

async function findUserForLogin(email) {
  const result = await supabase
    .from('usuarios')
    .select('id, nombre, email, password_hash, rol, token_version')
    .eq('email', email)
    .single();

  if (!isMissingTokenVersionColumn(result.error)) return result;

  const fallback = await supabase
    .from('usuarios')
    .select('id, nombre, email, password_hash, rol')
    .eq('email', email)
    .single();

  if (fallback.data) fallback.data.token_version = 0;
  return fallback;
}

async function auditAuthEvent({ eventType, usuarioId = null, email = null, req, metadata = {} }) {
  try {
    await supabase.from('auth_audit_logs').insert([{
      event_type: eventType,
      usuario_id: usuarioId,
      email,
      ip_address: getClientIp(req),
      user_agent: req.get('user-agent') || null,
      metadata
    }]);
  } catch (error) {
    console.error('Error registrando auditoría auth:', error.message);
  }
}

// ── REGISTRAR NUEVO USUARIO ──────────────────────────────────────
const register = async (req, res) => {
  const { nombre, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });

  try {
    // Verificar si el email ya existe en la base de datos
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existente)
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });

    // Encriptar contraseña con bcrypt (10 rondas de sal)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario con rol por defecto 'usuario'
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password_hash: passwordHash, rol: 'usuario' }])
      .select()
      .single();

    if (error) throw error;

    // Generar token JWT con los datos del usuario (expira en 7 días)
    const token = signUserToken(usuario);

    res.status(201).json({
      mensaje: '¡Cuenta creada exitosamente!',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: normalizeRole(usuario.rol) }
    });

  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── INICIAR SESIÓN ───────────────────────────────────────────────
const login = async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });

  try {
    // Buscar usuario por email en la base de datos
    const { data: usuario, error } = await findUserForLogin(email);

    // Si no existe el email, devolver error 401 (mismo mensaje genérico por seguridad)
    if (error || !usuario)
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });

    // Comparar la contraseña ingresada con el hash almacenado
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    // Si la contraseña no coincide, devolver error 401 con mensaje claro
    if (!passwordValida)
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });

    // Generar token JWT (7 días de validez)
    const token = signUserToken(usuario);

    res.json({
      mensaje: `¡Bienvenido, ${usuario.nombre}!`,
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: normalizeRole(usuario.rol) }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PERFIL DEL USUARIO ACTUAL ────────────────────────────────────
const perfil = async (req, res) => {
  try {
    // Obtener datos del usuario autenticado (excluyendo password_hash)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, created_at')
      .eq('id', req.user.id)
      .single();

    res.json({ usuario: usuario ? { ...usuario, rol: normalizeRole(usuario.rol) } : usuario });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil.' });
  }
};

const solicitarReset = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email)
    return res.status(400).json({ error: 'El email es obligatorio.' });

  const ip = getClientIp(req);
  const rateKey = `${ip}:${email}`;
  if (!enforceRateLimit(resetRequestLimits, rateKey, { limit: 5, windowMs: 15 * 60 * 1000 })) {
    await auditAuthEvent({ eventType: 'password_reset_rate_limited', email, req });
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta nuevamente más tarde.' });
  }

  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('email', email)
      .single();

    if (!usuario) {
      await auditAuthEvent({ eventType: 'password_reset_requested_unknown_email', email, req });
      return res.json({ mensaje: GENERIC_RESET_MESSAGE });
    }

    const { token, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from('password_reset_tokens')
      .update({ consumed_at: new Date().toISOString() })
      .eq('usuario_id', usuario.id)
      .is('consumed_at', null);

    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([{
        usuario_id: usuario.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        requested_ip: ip || null,
        requested_user_agent: req.get('user-agent') || null
      }]);

    if (tokenError) throw tokenError;

    const resetUrl = buildResetUrl(req, token);
    await sendPasswordResetEmail({
      to: usuario.email,
      name: usuario.nombre,
      resetUrl,
      expiresMinutes: RESET_TOKEN_TTL_MINUTES
    });

    await supabase
      .from('usuarios')
      .update({ reset_token: null, reset_token_expires: null })
      .eq('id', usuario.id);

    await auditAuthEvent({
      eventType: 'password_reset_requested',
      usuarioId: usuario.id,
      email,
      req,
      metadata: { expiresAt }
    });

    res.json({ mensaje: GENERIC_RESET_MESSAGE });

  } catch (err) {
    console.error('Error en solicitarReset:', err);
    await auditAuthEvent({ eventType: 'password_reset_request_failed', email, req, metadata: { reason: err.message } });
    res.json({ mensaje: GENERIC_RESET_MESSAGE });
  }
};

const confirmarReset = async (req, res) => {
  const token = String(req.body.token || '');
  const nuevaPassword = req.body.nueva_password || req.body.password;

  if (!token || !nuevaPassword)
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });

  if (!isStrongPassword(nuevaPassword))
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' });

  const ip = getClientIp(req);
  if (!enforceRateLimit(resetConfirmLimits, ip || 'unknown', { limit: 10, windowMs: 15 * 60 * 1000 })) {
    await auditAuthEvent({ eventType: 'password_reset_confirm_rate_limited', req });
    return res.status(429).json({ error: 'Demasiados intentos. Intenta nuevamente más tarde.' });
  }

  try {
    const tokenHash = hashResetToken(token);
    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('id, usuario_id, expires_at, consumed_at')
      .eq('token_hash', tokenHash)
      .single();

    if (!resetToken || resetToken.consumed_at) {
      await auditAuthEvent({ eventType: 'password_reset_invalid_token', req });
      return res.status(400).json({ error: 'Token inválido o ya utilizado.' });
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      await supabase
        .from('password_reset_tokens')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', resetToken.id);
      await auditAuthEvent({ eventType: 'password_reset_expired_token', usuarioId: resetToken.usuario_id, req });
      return res.status(400).json({ error: 'El token ha expirado. Solicita un nuevo restablecimiento.' });
    }

    const { data: consumedRows, error: consumeError } = await supabase
      .from('password_reset_tokens')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', resetToken.id)
      .is('consumed_at', null)
      .select('id');

    if (consumeError) throw consumeError;
    if (!consumedRows?.length) {
      await auditAuthEvent({ eventType: 'password_reset_replay_blocked', usuarioId: resetToken.usuario_id, req });
      return res.status(400).json({ error: 'Token inválido o ya utilizado.' });
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    const { error: userError } = await supabase
      .from('usuarios')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', resetToken.usuario_id);

    if (userError) throw userError;

    const { data: usuarioActual } = await supabase
      .from('usuarios')
      .select('token_version')
      .eq('id', resetToken.usuario_id)
      .single();

    await supabase
      .from('usuarios')
      .update({ token_version: (usuarioActual?.token_version || 0) + 1 })
      .eq('id', resetToken.usuario_id);

    await auditAuthEvent({ eventType: 'password_reset_completed', usuarioId: resetToken.usuario_id, req });

    res.json({ mensaje: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.' });

  } catch (err) {
    console.error('Error en confirmarReset:', err);
    await auditAuthEvent({ eventType: 'password_reset_confirm_failed', req, metadata: { reason: err.message } });
    res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
};

module.exports = { register, login, perfil, solicitarReset, confirmarReset };
