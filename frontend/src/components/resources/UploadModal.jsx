import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatSize } from '../../utils/formatters'

const categories = ['Diagnóstico', 'Redes', 'Programación', 'Mantenimiento', 'Seguridad', 'Plantillas', 'Otro']
const emptyUploadForm = { nombre: '', descripcion: '', categoria: 'Diagnóstico', tags: '' }

export function UploadModal({ open, onClose, resourcesState, resetKey = 0 }) {
  const [form, setForm] = useState(emptyUploadForm)
  const [file, setFile] = useState(null)
  const {
    setUploadError,
    setUploadSuccess,
    uploadError,
    uploadResource,
    uploadSuccess,
    uploading
  } = resourcesState

  useEffect(() => {
    setForm(emptyUploadForm)
    setFile(null)
    setUploadError('')
    setUploadSuccess('')
  }, [resetKey, setUploadError, setUploadSuccess])

  async function submit(event) {
    event.preventDefault()
    if (!file) {
      setUploadError('Debes seleccionar un archivo.')
      return
    }
    await uploadResource({ ...form, archivo: file })
    setForm(emptyUploadForm)
    setFile(null)
  }

  return (
    <Modal open={open} title="Subir nuevo recurso" onClose={onClose}>
      {uploadError && <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-500/15 p-3 text-sm text-rose-100">{uploadError}</div>}
      {uploadSuccess && <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/15 p-3 text-sm text-emerald-100">{uploadSuccess}</div>}
      <form className="grid gap-4" onSubmit={submit}>
        <input className="field" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del recurso" />
        <textarea className="field min-h-28" required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" />
        <select className="field" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input className="field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Etiquetas separadas por coma" />
        <label className="grid min-w-0 cursor-pointer place-items-center rounded-[1.5rem] border border-dashed border-white/20 bg-white/5 p-5 text-center transition hover:border-cyan/50 hover:bg-cyan/5 sm:p-8">
          <input className="sr-only" type="file" accept=".pdf,.docx,.doc,.py,.sql,.bat,.sh,.zip,.rar,.exe,.txt,.js,.ts" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <strong className="max-w-full break-words text-white">{file ? file.name : 'Seleccionar archivo'}</strong>
          <span className="mt-2 max-w-full text-sm leading-6 text-slate-400">{file ? formatSize(file.size) : 'PDF, DOCX, PY, SQL, BAT, ZIP, RAR, EXE - max. 50 MB'}</span>
        </label>
        <div className="grid gap-2 sm:flex sm:justify-end">
          <Button type="button" className="w-full sm:w-auto" onClick={onClose}>Cancelar</Button>
          <Button className="btn-primary w-full sm:w-auto" disabled={uploading}>{uploading ? 'Subiendo...' : 'Publicar recurso'}</Button>
        </div>
      </form>
    </Modal>
  )
}
