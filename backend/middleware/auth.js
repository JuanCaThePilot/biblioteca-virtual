// middleware/auth.js
// Protege rutas: verifica que el usuario tenga un token válido

const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Middleware para rutas que requieren login
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Debes iniciar sesión.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, token_version')
      .eq('id', decoded.id)
      .single();

    if (error || !usuario) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }

    if ((decoded.tokenVersion || 0) !== (usuario.token_version || 0)) {
      return res.status(403).json({ error: 'La sesión expiró. Inicia sesión nuevamente.' });
    }

    req.user = {
      ...decoded,
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: usuario.rol,
      rol: usuario.rol
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware solo para administradores
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden hacer esto.' });
    }

    next();
  });
};

module.exports = { requireAuth, requireAdmin };
