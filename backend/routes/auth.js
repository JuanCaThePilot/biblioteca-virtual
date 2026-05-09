// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, perfil } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/register  → Crear cuenta
router.post('/register', register);

// POST /api/auth/login     → Iniciar sesión
router.post('/login', login);

// GET  /api/auth/perfil    → Ver mi perfil (requiere token)
router.get('/perfil', requireAuth, perfil);

module.exports = router;
