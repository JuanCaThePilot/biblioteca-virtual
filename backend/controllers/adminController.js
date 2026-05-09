// controllers/adminController.js
const supabase = require('../config/supabase');

// ── VER RECURSOS PENDIENTES DE APROBACIÓN ────────────────────────
const pendientes = async (req, res) => {
  const { data, error } = await supabase
    .from('recursos')
    .select('*, usuarios(nombre, email)')
    .eq('aprobado', false)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: 'Error al obtener pendientes.' });
  res.json({ pendientes: data });
};

// ── APROBAR RECURSO ──────────────────────────────────────────────
const aprobar = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('recursos')
    .update({ aprobado: true })
    .eq('id', id);

  if (error) return res.status(500).json({ error: 'Error al aprobar recurso.' });
  res.json({ mensaje: 'Recurso aprobado y publicado en la biblioteca.' });
};

// ── RECHAZAR RECURSO ─────────────────────────────────────────────
const rechazar = async (req, res) => {
  const { id } = req.params;

  // Obtener ruta del archivo para borrarlo
  const { data: recurso } = await supabase
    .from('recursos').select('archivo_url').eq('id', id).single();

  if (recurso?.archivo_url) {
    const ruta = recurso.archivo_url.split('/archivos/')[1];
    await supabase.storage.from('archivos').remove([ruta]);
  }

  await supabase.from('recursos').delete().eq('id', id);
  res.json({ mensaje: 'Recurso rechazado y eliminado.' });
};

// ── LISTAR TODOS LOS USUARIOS ────────────────────────────────────
const listarUsuarios = async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Error al obtener usuarios.' });
  res.json({ usuarios: data });
};

// ── CAMBIAR ROL DE USUARIO ───────────────────────────────────────
const cambiarRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['usuario', 'admin'].includes(rol))
    return res.status(400).json({ error: 'Rol inválido. Usa: usuario o admin.' });

  const { error } = await supabase
    .from('usuarios')
    .update({ rol })
    .eq('id', id);

  if (error) return res.status(500).json({ error: 'Error al cambiar rol.' });
  res.json({ mensaje: `Rol actualizado a "${rol}" exitosamente.` });
};

// ── ESTADÍSTICAS DEL PANEL ───────────────────────────────────────
const estadisticas = async (req, res) => {
  const [
    { count: totalRecursos },
    { count: pendientesCount },
    { count: totalUsuarios },
    { data: topRecursos }
  ] = await Promise.all([
    supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('aprobado', true),
    supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('aprobado', false),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('recursos').select('nombre, descargas, categoria').eq('aprobado', true).order('descargas', { ascending: false }).limit(5)
  ]);

  res.json({
    totalRecursos,
    pendientesCount,
    totalUsuarios,
    topRecursos
  });
};

module.exports = { pendientes, aprobar, rechazar, listarUsuarios, cambiarRol, estadisticas };
