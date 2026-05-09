// routes/admin.js
const express = require('express');
const router = express.Router();
const { pendientes, aprobar, rechazar, listarUsuarios, cambiarRol, estadisticas } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Todas las rutas de admin requieren rol "admin"
router.use(requireAdmin);

// GET    /api/admin/estadisticas          → Dashboard con números
router.get('/estadisticas', estadisticas);

// GET    /api/admin/pendientes            → Recursos esperando aprobación
router.get('/pendientes', pendientes);

// PATCH  /api/admin/recursos/:id/aprobar  → Aprobar un recurso
router.patch('/recursos/:id/aprobar', aprobar);

// DELETE /api/admin/recursos/:id/rechazar → Rechazar y eliminar recurso
router.delete('/recursos/:id/rechazar', rechazar);

// GET    /api/admin/usuarios              → Ver todos los usuarios
router.get('/usuarios', listarUsuarios);

// PATCH  /api/admin/usuarios/:id/rol      → Cambiar rol de usuario
router.patch('/usuarios/:id/rol', cambiarRol);

module.exports = router;
