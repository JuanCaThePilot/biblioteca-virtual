// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// ── REGISTRAR NUEVO USUARIO ──────────────────────────────────────
const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });

  try {
    // Verificar si el email ya existe
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existente)
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario (rol por defecto: 'usuario')
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password_hash: passwordHash, rol: 'usuario' }])
      .select()
      .single();

    if (error) throw error;

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: '¡Cuenta creada exitosamente!',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });

  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── INICIAR SESIÓN ───────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario)
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida)
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: `¡Bienvenido, ${usuario.nombre}!`,
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PERFIL DEL USUARIO ACTUAL ────────────────────────────────────
const perfil = async (req, res) => {
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, created_at')
      .eq('id', req.user.id)
      .single();

    res.json({ usuario });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil.' });
  }
};

module.exports = { register, login, perfil };
