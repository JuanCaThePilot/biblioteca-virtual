// server.js — Punto de entrada principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendPath = frontendDistPath;

// Dynamic check: validates on each request so the build can be generated while the server is running
function isFrontendBuilt() {
  return require('fs').existsSync(path.join(frontendPath, 'index.html'));
}
console.log('📁 Frontend build:', isFrontendBuilt() ? frontendPath : 'no construido');
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://biblioteca-frontend-jz0w.onrender.com'
];

// ── MIDDLEWARES GLOBALES ─────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS.'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir el build de React si existe. express.static falla silenciosamente si el directorio no existe.
app.use(express.static(frontendPath));

// ── RUTAS DE LA API ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/recursos', require('./routes/recursos'));
app.use('/api/admin',    require('./routes/admin'));

// Ruta raíz → envía el index.html del frontend si está construido
app.get('/', (req, res) => {
  if (isFrontendBuilt()) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.json({ mensaje: 'API Biblioteca Virtual funcionando. El frontend debe construirse con: cd frontend && npm run build' });
  }
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
  console.log(`\n✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📚 Biblioteca Virtual — Backend listo\n`);
});
