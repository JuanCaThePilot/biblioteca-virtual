// routes/recursos.js
const express = require('express');
const router = express.Router();
const { listar, estadisticasPublicas, obtener, subir, descargar, eliminar, upload } = require('../controllers/recursosController');
const { requireAuth } = require('../middleware/auth');

// GET  /api/recursos           → Listar recursos aprobados (público)
router.get('/', listar);

// GET  /api/recursos/estadisticas → Totales públicos de la biblioteca
router.get('/estadisticas', estadisticasPublicas);

// GET  /api/recursos/:id/descargar → Descargar (público, registra la descarga)
router.get('/:id/descargar', descargar);

// POST /api/recursos           → Subir recurso (requiere login)
router.post('/', requireAuth, upload.single('archivo'), subir);

// GET  /api/recursos/:id       → Ver un recurso (público)
router.get('/:id', obtener);

// DELETE /api/recursos/:id     → Eliminar (dueño o admin)
router.delete('/:id', requireAuth, eliminar);

module.exports = router;
