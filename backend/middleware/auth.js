// middleware/auth.js
// Protege rutas: verifica que el usuario tenga un token válido

const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Middleware para rutas que requieren login
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Debes iniciar sesión.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guarda los datos del usuario en la petición
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware solo para administradores
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, async () => {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', req.user.id)
        .single();

      if (error || usuario?.rol !== 'admin') {
        return res.status(403).json({ error: 'Solo los administradores pueden hacer esto.' });
      }

      req.user.role = usuario.rol;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Error al verificar permisos de administrador.' });
    }
  });
};

module.exports = { requireAuth, requireAdmin };
