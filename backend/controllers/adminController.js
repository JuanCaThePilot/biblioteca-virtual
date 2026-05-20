// controllers/adminController.js
const supabase = require('../config/supabase');

const obtenerRutaStorage = (archivoUrl) => {
  if (!archivoUrl || !archivoUrl.includes('/archivos/')) return null;
  return archivoUrl.split('/archivos/')[1];
};

const eliminarArchivoStorage = async (archivoUrl) => {
  const ruta = obtenerRutaStorage(archivoUrl);
  if (!ruta) return;
  await supabase.storage.from('archivos').remove([ruta]);
};

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

// ── LISTAR RECURSOS PUBLICADOS ───────────────────────────────────
const listarRecursos = async (req, res) => {
  const { data, error } = await supabase
    .from('recursos')
    .select('*, usuarios(nombre, email)')
    .eq('aprobado', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Error al obtener recursos publicados.' });
  res.json({ recursos: data });
};

// ── EDITAR DESCRIPCIÓN DE RECURSO PUBLICADO ─────────────────────
const editarDescripcion = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ error: 'La descripción no puede estar vacía.' });
  }

  const { data, error } = await supabase
    .from('recursos')
    .update({ descripcion: descripcion.trim() })
    .eq('id', id)
    .select('id, nombre, descripcion')
    .single();

  if (error || !data) return res.status(500).json({ error: 'Error al actualizar descripción.' });
  res.json({ mensaje: 'Descripción actualizada correctamente.', recurso: data });
};

// ── ELIMINAR RECURSO PUBLICADO ──────────────────────────────────
const eliminarRecurso = async (req, res) => {
  const { id } = req.params;

  const { data: recurso, error: findError } = await supabase
    .from('recursos')
    .select('archivo_url')
    .eq('id', id)
    .single();

  if (findError || !recurso) return res.status(404).json({ error: 'Recurso no encontrado.' });

  await eliminarArchivoStorage(recurso.archivo_url);

  const { error } = await supabase.from('recursos').delete().eq('id', id);
  if (error) return res.status(500).json({ error: 'Error al eliminar recurso.' });

  res.json({ mensaje: 'Recurso eliminado correctamente.' });
};

// ── RECHAZAR RECURSO ─────────────────────────────────────────────
const rechazar = async (req, res) => {
  const { id } = req.params;

  // Obtener ruta del archivo para borrarlo
  const { data: recurso } = await supabase
    .from('recursos').select('archivo_url').eq('id', id).single();

  if (recurso?.archivo_url) await eliminarArchivoStorage(recurso.archivo_url);

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

  const { data: usuario, error: findError } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('id', id)
    .single();

  if (findError || !usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  if (usuario.rol === 'superadmin') {
    return res.status(403).json({ error: 'No puedes modificar el rol de un superadministrador desde el panel.' });
  }

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

module.exports = {
  pendientes,
  aprobar,
  listarRecursos,
  editarDescripcion,
  eliminarRecurso,
  rechazar,
  listarUsuarios,
  cambiarRol,
  estadisticas
};
