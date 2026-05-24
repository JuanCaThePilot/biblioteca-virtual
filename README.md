# 📚 Biblioteca Virtual — Ingeniería de Sistemas
## Guía completa de instalación paso a paso

---

## 🗂️ Estructura del proyecto

```
biblioteca-virtual/
├── backend/                 ← Servidor Node.js
│   ├── config/
│   │   └── supabase.js      ← Conexión a la base de datos
│   ├── controllers/
│   │   ├── authController.js    ← Login y registro
│   │   ├── recursosController.js ← Subir/descargar archivos
│   │   └── adminController.js   ← Panel de moderación
│   ├── middleware/
│   │   └── auth.js          ← Verificación de tokens
│   ├── routes/
│   │   ├── auth.js          ← Rutas /api/auth/*
│   │   ├── recursos.js      ← Rutas /api/recursos/*
│   │   └── admin.js         ← Rutas /api/admin/*
│   ├── server.js            ← Punto de entrada
│   ├── package.json
│   └── .env.example         ← Plantilla de variables
├── frontend/
│   └── public/
│       └── index.html       ← App completa (HTML + CSS + JS)
└── database/
    └── schema.sql           ← Tablas de la base de datos
```

---



**Error: "supabaseUrl is required"**
→ Verifica que el archivo `.env` esté en la carpeta `backend/`
  y que tenga los valores correctos (sin espacios ni comillas extra)
