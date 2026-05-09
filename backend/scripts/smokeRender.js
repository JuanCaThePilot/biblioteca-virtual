const API = process.env.RENDER_API || 'https://biblioteca-virtual-l4cu.onrender.com/api';
const supabase = require('../config/supabase');

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

async function step(name, fn) {
  try {
    const value = await fn();
    console.log(`OK - ${name}: ${value}`);
  } catch (error) {
    console.log(`ERROR - ${name}: ${error.message || error}`);
    process.exitCode = 1;
  }
}

async function main() {
  const stamp = Date.now();
  const email = `render-test-${stamp}@example.com`;
  const password = 'Prueba12345';
  let token = null;
  let recursoId = null;
  let storagePath = null;

  await step('GET /api/recursos/estadisticas', async () => {
    const data = await request('/recursos/estadisticas');
    return `recursos=${data.totalRecursos ?? 0}, usuarios=${data.totalUsuarios ?? 0}, descargas=${data.totalDescargas ?? 0}`;
  });

  await step('GET /api/recursos', async () => {
    const data = await request('/recursos');
    return `recursos=${Array.isArray(data.recursos) ? data.recursos.length : 0}`;
  });

  await step('POST /api/auth/login invalido', async () => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'no-existe@example.com', password: 'wrong-password' })
    });
    const data = await response.json().catch(() => ({}));

    if (response.status !== 401) {
      throw new Error(data.error || `Se esperaba HTTP 401 y llego HTTP ${response.status}`);
    }

    return 'HTTP 401 esperado';
  });

  try {
    await step('POST /api/auth/register remoto', async () => {
      const data = await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Render Test', email, password })
      });
      token = data.token;
      return `usuario=${data.usuario?.email}`;
    });

    await step('POST /api/auth/login remoto', async () => {
      const data = await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      token = data.token;
      return `usuario=${data.usuario?.email}`;
    });

    await step('POST /api/recursos remoto', async () => {
      const form = new FormData();
      form.append('nombre', `Recurso Render Test ${stamp}`);
      form.append('descripcion', 'Recurso temporal creado por smoke test remoto.');
      form.append('categoria', 'Programacion');
      form.append('tags', 'render,smoke,test');
      form.append('archivo', new Blob(['Archivo temporal Render smoke test'], { type: 'text/plain' }), `render-test-${stamp}.txt`);

      const data = await request('/recursos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      recursoId = data.recurso?.id;
      storagePath = data.recurso?.archivo_url?.split('/archivos/')[1] || null;
      return `recurso=${recursoId}`;
    });

    await step('Aprobar recurso remoto temporal', async () => {
      const { error } = await supabase
        .from('recursos')
        .update({ aprobado: true })
        .eq('id', recursoId);
      if (error) throw error;
      return 'aprobado';
    });

    await step('GET /api/recursos remoto incluye aprobado', async () => {
      const data = await request('/recursos?buscar=Render%20Test');
      const exists = (data.recursos || []).some((recurso) => recurso.id === recursoId);
      if (!exists) throw new Error('El recurso aprobado no aparecio en Render');
      return `recursos=${data.recursos.length}`;
    });

    await step('GET /api/recursos/:id/descargar remoto', async () => {
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
  }
}

main();
