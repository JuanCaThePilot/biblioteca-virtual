// config/supabase.js
// Conexión centralizada a Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Faltan variables de entorno obligatorias: ${missingEnvVars.join(', ')}`);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Service key para operaciones del servidor
);

module.exports = supabase;
