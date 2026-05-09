// controllers/recursosController.js
const supabase = require('../config/supabase');
const multer = require('multer');

// Multer en memoria (el archivo va directo a Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/x-python', 'application/zip',
      'application/x-zip-compressed', 'application/x-rar-compressed',
      'application/vnd.rar', 'application/x-msdownload', 'application/octet-stream'
    ];
    if (tiposPermitidos.includes(file.mimetype) || file.originalname.match(/\.(py|sql|bat|sh|js|ts|zip|rar|exe|pdf|docx|doc|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido.'));
    }
  }
});

// ── LISTAR RECURSOS (con filtros) ────────────────────────────────
const listar = async (req, res) => {
  const { categoria, buscar, orden = 'reciente', pagina = 1 } = req.query;
  const porPagina = 12;
  const paginaActual = Math.max(Number.parseInt(pagina, 10) || 1, 1);
  const desde = (paginaActual - 1) * porPagina;

  try {
    let query = supabase
      .from('recursos')
      .select('*, usuarios(nombre)', { count: 'exact' })
      .eq('aprobado', true)
      .range(desde, desde + porPagina - 1);

    if (categoria) query = query.eq('categoria', categoria);
    if (buscar) query = query.ilike('nombre', `%${buscar}%`);
    if (orden === 'popular') query = query.order('descargas', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ recursos: data, total: count, pagina: paginaActual, porPagina });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener recursos.' });
  }
};

// ── ESTADÍSTICAS PÚBLICAS ────────────────────────────────────────
const estadisticasPublicas = async (req, res) => {
  try {
    const [
      { count: totalRecursos, error: recursosError },
      { count: totalUsuarios, error: usuariosError },
      { data: recursos, error: descargasError }
    ] = await Promise.all([
      supabase.from('recursos').select('id', { count: 'exact', head: true }).eq('aprobado', true),
      supabase.from('usuarios').select('id', { count: 'exact', head: true }),
      supabase.from('recursos').select('descargas').eq('aprobado', true)
    ]);

    if (recursosError || usuariosError || descargasError) {
      throw recursosError || usuariosError || descargasError;
    }

    const totalDescargas = (recursos || []).reduce((total, recurso) => total + (recurso.descargas || 0), 0);

    res.json({ totalRecursos, totalUsuarios, totalDescargas });
  } catch (err) {
    console.error('Error en estadisticasPublicas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
};

// ── OBTENER UN RECURSO ───────────────────────────────────────────
const obtener = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('recursos')
      .select('*, usuarios(nombre, email)')
      .eq('id', id)
      .eq('aprobado', true)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Recurso no encontrado.' });
    res.json({ recurso: data });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener recurso.' });
  }
};

// ── SUBIR RECURSO ────────────────────────────────────────────────
const subir = async (req, res) => {
  const { nombre, descripcion, categoria, tags } = req.body;
  const archivo = req.file;

  if (!nombre || !descripcion || !categoria || !archivo)
    return res.status(400).json({ error: 'Nombre, descripción, categoría y archivo son obligatorios.' });

  try {
    // 1. Subir archivo a Supabase Storage
    const extension = archivo.originalname.split('.').pop().toLowerCase();
    const nombreSeguro = archivo.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const nombreArchivo = `${Date.now()}_${req.user.id}_${nombreSeguro}`;
    const rutaStorage = `recursos/${nombreArchivo}`;

    const { error: storageError } = await supabase.storage
      .from('archivos')
      .upload(rutaStorage, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false
      });

    if (storageError) throw storageError;

    // 2. Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('archivos')
      .getPublicUrl(rutaStorage);

    // 3. Guardar metadata en la base de datos
    const { data: recurso, error: dbError } = await supabase
      .from('recursos')
      .insert([{
        nombre,
        descripcion,
        categoria,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        archivo_url: urlData.publicUrl,
        archivo_nombre: archivo.originalname,
        archivo_tipo: extension.toUpperCase(),
        archivo_tamaño: archivo.size,
        usuario_id: req.user.id,
        descargas: 0,
        aprobado: false // Requiere aprobación del admin
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({
      mensaje: 'Recurso subido exitosamente. Pendiente de aprobación por el administrador.',
      recurso
    });

  } catch (err) {
    console.error('Error al subir recurso:', err);
    res.status(500).json({ error: 'Error al subir el recurso.' });
  }
};

// ── DESCARGAR (incrementa contador) ─────────────────────────────
const descargar = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: recurso } = await supabase
      .from('recursos')
      .select('archivo_url, archivo_nombre, descargas')
      .eq('id', id)
      .eq('aprobado', true)
      .single();

    if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado.' });

    // Incrementar contador de descargas
    await supabase
      .from('recursos')
      .update({ descargas: recurso.descargas + 1 })
      .eq('id', id);

    res.json({ url: recurso.archivo_url, nombre: recurso.archivo_nombre });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar descarga.' });
  }
};

// ── ELIMINAR RECURSO (dueño o admin) ────────────────────────────
const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: recurso } = await supabase
      .from('recursos')
      .select('usuario_id, archivo_url')
      .eq('id', id)
      .single();

    if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado.' });

    // Solo el dueño o un admin puede eliminar
    if (recurso.usuario_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'No tienes permiso para eliminar este recurso.' });

    // Eliminar de Storage
    const ruta = recurso.archivo_url.split('/archivos/')[1];
    await supabase.storage.from('archivos').remove([ruta]);

    // Eliminar de la base de datos
    await supabase.from('recursos').delete().eq('id', id);

    res.json({ mensaje: 'Recurso eliminado exitosamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el recurso.' });
  }
};

module.exports = { listar, estadisticasPublicas, obtener, subir, descargar, eliminar, upload };
