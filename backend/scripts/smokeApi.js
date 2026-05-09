require('dotenv').config();

const { spawn } = require('child_process');
const supabase = require('../config/supabase');

const PORT = process.env.SMOKE_PORT || '3999';
const API = `http://127.0.0.1:${PORT}/api`;
const results = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function step(name, fn) {
  try {
    const value = await fn();
    results.push({ name, ok: true, value });
  } catch (error) {
    results.push({ name, ok: false, error: error.message || String(error) });
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function waitForServer(child) {
  for (let i = 0; i < 30; i += 1) {
    if (child.exitCode !== null) {
      throw new Error(`El servidor termino antes de responder. Codigo: ${child.exitCode}`);
    }

    try {
      await request('/recursos/estadisticas');
      return;
    } catch {
      await wait(500);
    }
  }

  throw new Error('El servidor no respondio a tiempo');
}

async function main() {
  const stamp = Date.now();
  const email = `api-test-${stamp}@example.com`;
  const password = 'Prueba12345';
  let token = null;
  let recursoId = null;
  let storagePath = null;

  const server = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer(server);

    await step('GET /api/recursos/estadisticas', async () => {
      const data = await request('/recursos/estadisticas');
      return `recursos=${data.totalRecursos ?? 0}, usuarios=${data.totalUsuarios ?? 0}`;
    });

    await step('GET /api/recursos', async () => {
      const data = await request('/recursos');
      return `recursos=${Array.isArray(data.recursos) ? data.recursos.length : 0}`;
    });

    await step('POST /api/auth/register', async () => {
      const data = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'API Test', email, password })
      });
      token = data.token;
      return `usuario=${data.usuario?.email}`;
    });

    await step('POST /api/auth/login', async () => {
      const data = await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      token = data.token;
      return `usuario=${data.usuario?.email}`;
    });

    await step('GET /api/auth/perfil', async () => {
      const data = await request('/auth/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return `usuario=${data.usuario?.email}`;
    });

    await step('POST /api/recursos', async () => {
      const form = new FormData();
      form.append('nombre', `Recurso API Test ${stamp}`);
      form.append('descripcion', 'Recurso temporal creado por smoke test.');
      form.append('categoria', 'Programacion');
      form.append('tags', 'smoke,test');
      form.append('archivo', new Blob(['Archivo temporal API smoke test'], { type: 'text/plain' }), `api-test-${stamp}.txt`);

      const data = await request('/recursos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      recursoId = data.recurso?.id;
      storagePath = data.recurso?.archivo_url?.split('/archivos/')[1] || null;
      return `recurso=${recursoId}`;
    });

    await step('Aprobar recurso temporal en Supabase', async () => {
      const { error } = await supabase
        .from('recursos')
        .update({ aprobado: true })
        .eq('id', recursoId);
      if (error) throw error;
      return 'aprobado';
    });

    await step('GET /api/recursos incluye recurso aprobado', async () => {
      const data = await request('/recursos?buscar=API%20Test');
      const exists = (data.recursos || []).some((recurso) => recurso.id === recursoId);
      if (!exists) throw new Error('El recurso aprobado no aparecio en el listado');
      return `recursos=${data.recursos.length}`;
    });

    await step('GET /api/recursos/:id/descargar', async () => {
      const data = await request(`/recursos/${recursoId}/descargar`);
      if (!data.url) throw new Error('No se recibio URL de descarga');
      return `archivo=${data.nombre}`;
    });
  } finally {
    if (recursoId) {
      await supabase.from('recursos').delete().eq('id', recursoId);
    }
    if (storagePath) {
      await supabase.storage.from('archivos').remove([storagePath]);
    }
    await supabase.from('usuarios').delete().eq('email', email);
    server.kill();
  }

  for (const item of results) {
    console.log(`${item.ok ? 'OK' : 'ERROR'} - ${item.name}: ${item.ok ? item.value : item.error}`);
  }

  const failed = results.filter((item) => !item.ok);
  process.exit(failed.length ? 1 : 0);
}

main();
