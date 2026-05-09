require('dotenv').config();

const { spawn } = require('child_process');
const supabase = require('../config/supabase');

const PORT = process.env.SMOKE_PORT || '3997';
const API = `http://127.0.0.1:${PORT}/api`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

async function waitForServer(child) {
  for (let i = 0; i < 30; i += 1) {
    if (child.exitCode !== null) throw new Error(`Servidor termino antes de responder: ${child.exitCode}`);
    try {
      await request('/recursos/estadisticas');
      return;
    } catch {
      await wait(500);
    }
  }
  throw new Error('Servidor no respondio a tiempo');
}

async function uploadResource(token, stamp, extension, mimeType) {
  const form = new FormData();
  form.append('nombre', `Admin Resource Test ${extension.toUpperCase()} ${stamp}`);
  form.append('descripcion', `Descripcion temporal ${extension}`);
  form.append('categoria', 'Programacion');
  form.append('tags', `admin,${extension},test`);
  form.append('archivo', new Blob([`Archivo temporal ${extension}`], { type: mimeType }), `admin-test-${stamp}.${extension}`);

  const data = await request('/recursos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  return data.recurso;
}

async function main() {
  const stamp = Date.now();
  const email = `admin-resources-test-${stamp}@example.com`;
  const password = 'Prueba12345';
  const createdResources = [];
  let token = null;
  let userId = null;

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
      body: JSON.stringify({ nombre: 'Admin Resources Test', email, password })
    });
    token = register.token;
    userId = register.usuario.id;
    console.log('OK - Usuario temporal creado');

    const { error: roleError } = await supabase.from('usuarios').update({ rol: 'admin' }).eq('id', userId);
    if (roleError) throw roleError;
    console.log('OK - Usuario temporal promovido a admin');

    const rar = await uploadResource(token, stamp, 'rar', 'application/vnd.rar');
    createdResources.push(rar);
    console.log(`OK - Archivo RAR aceptado: ${rar.archivo_nombre}`);

    const exe = await uploadResource(token, stamp, 'exe', 'application/x-msdownload');
    createdResources.push(exe);
    console.log(`OK - Archivo EXE aceptado: ${exe.archivo_nombre}`);

    const { error: approveError } = await supabase.from('recursos').update({ aprobado: true }).eq('id', rar.id);
    if (approveError) throw approveError;
    console.log('OK - Recurso RAR aprobado temporalmente');

    const list = await request('/admin/recursos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!(list.recursos || []).some((resource) => resource.id === rar.id)) {
      throw new Error('El recurso aprobado no aparecio en /api/admin/recursos');
    }
    console.log('OK - Admin lista recursos publicados');

    const nuevaDescripcion = `Descripcion editada ${stamp}`;
    const edit = await request(`/admin/recursos/${rar.id}/descripcion`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ descripcion: nuevaDescripcion })
    });
    if (edit.recurso?.descripcion !== nuevaDescripcion) throw new Error('La descripcion no cambio');
    console.log('OK - Admin edita descripcion');

    await request(`/admin/recursos/${rar.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    createdResources.splice(createdResources.findIndex((resource) => resource.id === rar.id), 1);
    console.log('OK - Admin elimina recurso publicado');
  } finally {
    for (const resource of createdResources) {
      const ruta = resource.archivo_url?.split('/archivos/')[1];
      await supabase.from('recursos').delete().eq('id', resource.id);
      if (ruta) await supabase.storage.from('archivos').remove([ruta]);
    }
    await supabase.from('usuarios').delete().eq('email', email);
    server.kill();
  }
}

main().catch((error) => {
  console.error(`ERROR - ${error.message || error}`);
  process.exit(1);
});
