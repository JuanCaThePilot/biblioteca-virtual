require('dotenv').config();

const { spawn } = require('child_process');
const supabase = require('../config/supabase');

const PORT = process.env.SMOKE_PORT || '3998';
const API = `http://127.0.0.1:${PORT}/api`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function waitForServer(child) {
  for (let i = 0; i < 30; i += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Servidor termino antes de responder: ${child.exitCode}`);
    }

    try {
      const { response } = await request('/recursos/estadisticas');
      if (response.ok) return;
    } catch {}

    await wait(500);
  }

  throw new Error('Servidor no respondio a tiempo');
}

async function main() {
  const stamp = Date.now();
  const email = `admin-role-test-${stamp}@example.com`;
  const password = 'Prueba12345';
  let userId = null;
  let token = null;

  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer(server);

    const register = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Admin Role Test', email, password })
    });

    if (!register.response.ok) throw new Error(register.data.error || 'No se pudo registrar');
    userId = register.data.usuario.id;
    token = register.data.token;
    console.log(`OK - Usuario creado como usuario: ${email}`);

    const before = await request('/admin/estadisticas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (before.response.status !== 403) {
      throw new Error(`Se esperaba 403 antes de cambiar rol, llego ${before.response.status}`);
    }
    console.log('OK - Admin bloqueado antes de cambiar rol: HTTP 403');

    const { error } = await supabase.from('usuarios').update({ rol: 'admin' }).eq('id', userId);
    if (error) throw error;
    console.log('OK - Rol cambiado a admin en Supabase');

    const profile = await request('/auth/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profile.response.ok || profile.data.usuario?.rol !== 'admin') {
      throw new Error('El perfil no refleja el rol admin actualizado');
    }
    console.log('OK - Perfil refleja rol admin sin reloguear');

    const after = await request('/admin/estadisticas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!after.response.ok) throw new Error(after.data.error || `HTTP ${after.response.status}`);
    console.log('OK - Admin permitido despues de cambiar rol');
  } finally {
    await supabase.from('usuarios').delete().eq('email', email);
    server.kill();
  }
}

main().catch((error) => {
  console.error(`ERROR - ${error.message || error}`);
  process.exit(1);
});
