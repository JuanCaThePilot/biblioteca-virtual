// routes/auth.js
// Define las rutas de autenticación: registro, login, perfil y recuperación de contraseña
const express = require('express');
const router = express.Router();
const { register, login, perfil, solicitarReset, confirmarReset } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/register       → Crear cuenta
router.post('/register', register);

// POST /api/auth/login          → Iniciar sesión
router.post('/login', login);

// POST /api/auth/solicitar-reset → Solicitar token de recuperación de contraseña
router.post('/solicitar-reset', solicitarReset);
router.post('/forgot-password', solicitarReset);

// POST /api/auth/confirmar-reset → Restablecer contraseña con token
router.post('/confirmar-reset', confirmarReset);
router.post('/reset-password', confirmarReset);

// GET  /api/auth/perfil         → Ver mi perfil (requiere token)
router.get('/perfil', requireAuth, perfil);

module.exports = router;
