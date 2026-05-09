require('dotenv').config();

const supabase = require('../config/supabase');

const results = [];

async function step(name, fn) {
  try {
    const value = await fn();
    results.push({ name, ok: true, value });
  } catch (error) {
    results.push({ name, ok: false, error: error.message || String(error) });
  }
}

async function main() {
  const stamp = Date.now();
  const testEmail = `codex-test-${stamp}@example.com`;
  const storagePath = `codex-tests/test-${stamp}.txt`;
  let userId = null;

  await step('Conectar y contar usuarios', async () => {
    const { count, error } = await supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return `usuarios=${count ?? 0}`;
  });

  await step('Conectar y contar recursos', async () => {
    const { count, error } = await supabase
      .from('recursos')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return `recursos=${count ?? 0}`;
  });

  await step('Insertar usuario temporal', async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: 'Codex Test',
        email: testEmail,
        password_hash: 'test_hash_temporal',
        rol: 'usuario'
      }])
      .select('id,email,rol')
      .single();
    if (error) throw error;
    userId = data.id;
    return `id=${data.id}, rol=${data.rol}`;
  });

  await step('Leer usuario temporal', async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id,email')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return `email=${data.email}`;
  });

  await step('Eliminar usuario temporal', async () => {
    if (!userId) return 'omitido';
    const { error } = await supabase.from('usuarios').delete().eq('id', userId);
    if (error) throw error;
    return 'eliminado';
  });

  await step('Subir archivo temporal a Storage', async () => {
    const { error } = await supabase.storage
      .from('archivos')
      .upload(storagePath, Buffer.from('Prueba temporal Codex'), {
        contentType: 'text/plain',
        upsert: false
      });
    if (error) throw error;
    return storagePath;
  });

  await step('Obtener URL publica Storage', async () => {
    const { data } = supabase.storage.from('archivos').getPublicUrl(storagePath);
    if (!data?.publicUrl) throw new Error('No se genero URL publica');
    return 'url_generada';
  });

  await step('Eliminar archivo temporal de Storage', async () => {
    const { error } = await supabase.storage.from('archivos').remove([storagePath]);
    if (error) throw error;
    return 'eliminado';
  });

  for (const item of results) {
    console.log(`${item.ok ? 'OK' : 'ERROR'} - ${item.name}: ${item.ok ? item.value : item.error}`);
  }

  const failed = results.filter((item) => !item.ok);
  process.exit(failed.length ? 1 : 0);
}

main();
