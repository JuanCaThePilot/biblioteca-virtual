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

## ✅ PASO 1 — Instalar herramientas necesarias

Descarga e instala (si no los tienes):

1. **Node.js** → https://nodejs.org (versión LTS)
2. **VS Code** → https://code.visualstudio.com
3. **Git** → https://git-scm.com (opcional pero recomendado)

Para verificar que Node.js quedó instalado, abre la terminal de VS Code
(`Ctrl + \``) y escribe:
```bash
node --version    # Debe mostrar algo como: v20.x.x
npm --version     # Debe mostrar algo como: 10.x.x
```

---

## ✅ PASO 2 — Crear cuenta en Supabase (GRATIS)

Supabase reemplaza Firebase, AWS S3 y PostgreSQL en uno solo, sin costo.

1. Ve a https://supabase.com y haz clic en **"Start your project"**
2. Regístrate con tu cuenta de GitHub o email
3. Crea un nuevo proyecto:
   - **Organization**: tu nombre
   - **Project name**: `biblioteca-virtual`
   - **Database Password**: guarda esta contraseña
   - **Region**: `South America (São Paulo)`
4. Espera ~2 minutos a que el proyecto se cree

---

## ✅ PASO 3 — Crear las tablas en Supabase

1. En tu proyecto de Supabase, ve al menú **"SQL Editor"**
2. Haz clic en **"New query"**
3. Copia y pega TODO el contenido del archivo `database/schema.sql`
4. Haz clic en **"Run"** (o Ctrl+Enter)
5. Deberías ver: `Success. No rows returned`

---

## ✅ PASO 4 — Crear el bucket de almacenamiento

1. En Supabase, ve a **"Storage"** en el menú lateral
2. Haz clic en **"New bucket"**
3. Nombre del bucket: `archivos`
4. Marca **"Public bucket"** como activo
5. Haz clic en **"Save"**

---

## ✅ PASO 5 — Obtener las claves de API de Supabase

1. En Supabase, ve a **"Settings"** → **"API"**
2. Copia estos tres valores:
   - **Project URL** (empieza con `https://...supabase.co`)
   - **anon public** (bajo "Project API keys")
   - **service_role secret** (haz clic en "Reveal" para verla)

---

## ✅ PASO 6 — Configurar las variables de entorno

1. Abre la carpeta `backend/` en VS Code
2. Copia el archivo `.env.example` y renómbralo a `.env`
3. Rellena con tus datos de Supabase:

```env
SUPABASE_URL=https://TU_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=cualquier_texto_largo_y_secreto_aqui_2024
PORT=3000
```

⚠️ **IMPORTANTE**: El archivo `.env` nunca debe subirse a GitHub.
Ya está en el `.gitignore` por defecto.

---

## ✅ PASO 7 — Instalar dependencias y arrancar el servidor

Abre la terminal en VS Code (`Ctrl + \``) y ejecuta:

```bash
# Entra a la carpeta del backend
cd backend

# Instala todas las dependencias
npm install

# Inicia el servidor en modo desarrollo
npm run dev
```

Deberías ver en la terminal:
```
✅ Servidor corriendo en http://localhost:3000
📚 Biblioteca Virtual — Backend listo
```

---

## ✅ PASO 8 — Abrir el frontend

**Opción A (recomendada):** Instala la extensión **"Live Server"** en VS Code:
1. Ve a Extensiones (`Ctrl+Shift+X`)
2. Busca "Live Server" de Ritwick Dey
3. Instálala
4. Abre `frontend/public/index.html`
5. Clic derecho → **"Open with Live Server"**
6. Se abre en `http://localhost:5500`

**Opción B:** Simplemente abre `frontend/public/index.html`
haciendo doble clic en el explorador de archivos.

---

## ✅ PASO 9 — Crear el primer usuario administrador

1. Abre la app en el navegador
2. Registra una cuenta normal con tu email
3. Ve a Supabase → **Table Editor** → tabla `usuarios`
4. Busca tu usuario y cambia el campo `rol` de `usuario` a `admin`
5. Refresca la app y ya aparecerá el botón **"Panel Admin"**

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción | Requiere auth |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | Crear cuenta | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/perfil` | Ver mi perfil | Sí |
| GET | `/api/recursos` | Listar recursos | No |
| GET | `/api/recursos/:id` | Ver recurso | No |
| POST | `/api/recursos` | Subir recurso | Sí |
| GET | `/api/recursos/:id/descargar` | Descargar | No |
| DELETE | `/api/recursos/:id` | Eliminar | Sí (dueño/admin) |
| GET | `/api/admin/estadisticas` | Dashboard admin | Admin |
| GET | `/api/admin/pendientes` | Recursos pendientes | Admin |
| PATCH | `/api/admin/recursos/:id/aprobar` | Aprobar recurso | Admin |
| DELETE | `/api/admin/recursos/:id/rechazar` | Rechazar recurso | Admin |
| GET | `/api/admin/usuarios` | Listar usuarios | Admin |
| PATCH | `/api/admin/usuarios/:id/rol` | Cambiar rol | Admin |

---

## 🚀 Para el proyecto de grado — Despliegue gratuito

Cuando quieras publicarlo en internet (gratis):

| Servicio | Para qué | URL |
|----------|---------|-----|
| **Railway** | Backend Node.js | railway.app |
| **Vercel** | Frontend HTML | vercel.com |
| **Supabase** | Base de datos + Storage | supabase.com |

Los tres son 100% gratuitos para proyectos académicos.

---

## ❓ Solución de problemas comunes

**Error: "Cannot connect to server"**
→ Verifica que el backend esté corriendo (`npm run dev`)

**Error: "Invalid JWT"**
→ Cierra sesión y vuelve a entrar

**Error al subir archivo**
→ Verifica que el bucket `archivos` en Supabase sea público

**Error: "supabaseUrl is required"**
→ Verifica que el archivo `.env` esté en la carpeta `backend/`
  y que tenga los valores correctos (sin espacios ni comillas extra)
