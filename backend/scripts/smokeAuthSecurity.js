require('dotenv').config();

const { spawn } = require('child_process');
const supabase = require('../config/supabase');

const PORT = process.env.SMOKE_PORT || '3996';
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
    if (child.exitCode !== null) throw new Error(`Servidor termino antes de responder: ${child.exitCode}`);
    try {
      const { response } = await request('/recursos/estadisticas');
      if (response.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error('Servidor no respondio a tiempo');
}

async function waitForResetToken(lines, email) {
  for (let i = 0; i < 30; i += 1) {
    const line = lines.find((entry) => entry.includes(`[password-reset]`) && entry.includes(email));
    const match = line?.match(/[?&]reset_token=([^&\s]+)/);
    if (match) return decodeURIComponent(match[1]);
    await wait(250);
  }
  throw new Error('No se encontro el token de reset en salida de desarrollo');
}

async function main() {
  const stamp = Date.now();
  const email = `auth-security-test-${stamp}@example.com`;
  const password = 'Prueba12345';
  const newPassword = 'NuevaClave123';
  let userId = null;
  let oldToken = null;
  const outputLines = [];

  for (const table of ['password_reset_tokens', 'auth_audit_logs']) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      throw new Error(`Falta aplicar database/schema.sql en Supabase: ${table} no existe (${error.message})`);
    }
  }

  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT, NODE_ENV: 'development', FRONTEND_URL: `http://127.0.0.1:${PORT}` },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.on('data', (chunk) => outputLines.push(String(chunk)));
  server.stderr.on('data', (chunk) => outputLines.push(String(chunk)));

  try {
    await waitForServer(server);

    const register = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Auth Security Test', email, password })
    });
    if (!register.response.ok) throw new Error(register.data.error || 'No se pudo registrar usuario');
    userId = register.data.usuario.id;
    oldToken = register.data.token;
    console.log('OK - Registro temporal');

    const unknown = await request('/auth/solicitar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `missing-${stamp}@example.com` })
    });
    if (!unknown.response.ok || unknown.data.reset_token) throw new Error('La respuesta de email desconocido no es generica');
    console.log('OK - Anti-enumeracion en email desconocido');

    const resetRequest = await request('/auth/solicitar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!resetRequest.response.ok || resetRequest.data.reset_token) throw new Error('El endpoint expuso el token de reset');
    console.log('OK - Solicitud reset no expone token');

    const resetToken = await waitForResetToken(outputLines, email);

    const invalid = await request('/auth/confirmar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'token-invalido', nueva_password: newPassword })
    });
    if (invalid.response.status !== 400) throw new Error('Token invalido no fue rechazado');
    console.log('OK - Token invalido rechazado');

    const valid = await request('/auth/confirmar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, nueva_password: newPassword })
    });
    if (!valid.response.ok) throw new Error(valid.data.error || 'No se pudo confirmar reset');
    console.log('OK - Reset valido completado');

    const replay = await request('/auth/confirmar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, nueva_password: 'OtraClave123' })
    });
    if (replay.response.status !== 400) throw new Error('Token reutilizado no fue rechazado');
    console.log('OK - Replay bloqueado');

    const oldProfile = await request('/auth/perfil', {
      headers: { Authorization: `Bearer ${oldToken}` }
    });
    if (oldProfile.response.status !== 403) throw new Error('Token anterior siguio siendo valido despues del reset');
    console.log('OK - Token anterior invalidado');

    const login = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword })
    });
    if (!login.response.ok) throw new Error(login.data.error || 'Login con nueva contraseña fallo');
    console.log('OK - Login con nueva contraseña');
  } finally {
    if (userId) {
      await supabase.from('password_reset_tokens').delete().eq('usuario_id', userId);
      await supabase.from('auth_audit_logs').delete().eq('usuario_id', userId);
    }
    await supabase.from('usuarios').delete().eq('email', email);
    server.kill();
  }
}

main().catch((error) => {
  console.error(`ERROR - ${error.message || error}`);
  process.exitCode = 1;
});
