// middleware/auth.js
// Protege rutas: verifica que el usuario tenga un token válido

const jwt = require('jsonwebtoken');

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
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden hacer esto.' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
