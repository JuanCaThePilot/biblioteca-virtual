// server.js — Punto de entrada principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

// ── MIDDLEWARES GLOBALES ─────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir el frontend estático desde la carpeta /frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ── RUTAS DE LA API ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/admin',    require('./routes/admin'));

// Ruta raíz → envía el index.html del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ── MANEJO DE ERRORES ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el tamaño máximo permitido de 50 MB.'
      : 'Error al procesar el archivo.';
    return res.status(400).json({ error: message });
  }

  if (err.message === 'Tipo de archivo no permitido.') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

// ── INICIAR SERVIDOR ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Biblioteca Virtual — Backend listo\n`);
});
