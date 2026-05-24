import { motion } from 'framer-motion'
import { Check, Edit3, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDate } from '../../utils/formatters'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SpotlightCard } from '../motion/SpotlightCard'
import { MotionSection, Reveal } from '../motion/MotionSection'

const sections = [
  ['estadisticas', 'Estadísticas'],
  ['pendientes', 'Pendientes'],
  ['recursos', 'Publicados'],
  ['usuarios', 'Usuarios']
]

export function AdminDashboard({ admin, onBack }) {
  const [section, setSection] = useState('estadisticas')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(null)
  const [description, setDescription] = useState('')
  const { loadSection } = admin

  useEffect(() => {
    loadSection(section).catch((error) => setToast(error.message))
  }, [loadSection, section])

  async function run(action) {
    try {
      const data = await action()
      setToast(data?.mensaje || 'Acción ejecutada')
    } catch (error) {
      setToast(error.message)
    }
  }

  async function saveDescription(event) {
    event.preventDefault()
    await run(() => admin.updateDescription(editing.id, description))
    setEditing(null)
    setDescription('')
  }

  return (
    <main className="section-shell min-h-screen pb-12 pt-28 sm:pt-32">
      <MotionSection as="div" className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan sm:text-sm sm:tracking-[0.2em]">Admin Console</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl lg:text-5xl">Panel de administración</h1>
            <p className="mt-3 text-slate-400">Modera recursos, edita descripciones y administra usuarios.</p>
          </Reveal>
        </div>
        <Button className="w-full sm:w-auto" onClick={onBack}>Volver a biblioteca</Button>
      </MotionSection>

      {toast && <div className="mb-5 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-slate-200">{toast}</div>}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[240px_1fr] lg:gap-5">
        <motion.aside initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="glass no-scrollbar flex h-max gap-2 overflow-x-auto rounded-[1.5rem] p-2 lg:sticky lg:top-28 lg:block lg:rounded-[1.75rem] lg:p-3">
          {sections.map(([id, label]) => (
            <button
              key={id}
              className={`shrink-0 rounded-2xl px-4 py-3 text-center text-sm font-bold transition lg:mb-1 lg:w-full lg:text-left ${section === id ? 'bg-white/12 text-white shadow-inner' : 'text-slate-400 hover:bg-white/7 hover:text-white'}`}
              onClick={() => setSection(id)}
            >
              {label}
            </button>
          ))}
        </motion.aside>

        <motion.section key={section} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass min-w-0 rounded-[1.5rem] p-3 sm:rounded-[2rem] sm:p-5">
          {section === 'estadisticas' && <StatsPanel stats={admin.adminStats} />}
          {section === 'pendientes' && <PendingTable items={admin.pending} run={run} admin={admin} />}
          {section === 'recursos' && (
            <PublishedTable
              items={admin.published}
              run={run}
              admin={admin}
              onEdit={(item) => {
                setEditing(item)
                setDescription(item.descripcion || '')
              }}
            />
          )}
          {section === 'usuarios' && <UsersTable items={admin.users} run={run} admin={admin} />}
        </motion.section>
      </div>

      <Modal open={Boolean(editing)} title="Editar descripción" onClose={() => setEditing(null)}>
        <form className="grid gap-4" onSubmit={saveDescription}>
          <input className="field" disabled value={editing?.nombre || ''} readOnly />
          <textarea className="field min-h-32" required value={description} onChange={(event) => setDescription(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button className="btn-primary">Guardar</Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}

function StatsPanel({ stats }) {
  const top = stats?.topRecursos || []
  return (
    <div>
      <h2 className="mb-5 text-xl font-black text-white sm:text-2xl">Resumen general</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Publicados" value={stats?.totalRecursos || 0} />
        <Stat label="Pendientes" value={stats?.pendientesCount || 0} />
        <Stat label="Usuarios" value={stats?.totalUsuarios || 0} />
      </div>
      <h3 className="mb-4 mt-8 text-lg font-black text-white sm:text-xl">Top recursos descargados</h3>
      <div className="-mx-1 overflow-x-auto rounded-[1.5rem] border border-white/10 sm:mx-0">
        <Table headers={['Recurso', 'Categoría', 'Descargas']}>
          {top.map((item) => (
            <tr key={`${item.nombre}-${item.categoria}`}>
              <Td strong>{item.nombre}</Td>
              <Td>{item.categoria}</Td>
              <Td>{item.descargas}</Td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  )
}

function PendingTable({ items, admin, run }) {
  return (
    <PanelTable title="Recursos pendientes" empty="Sin recursos pendientes." headers={['Nombre', 'Tipo', 'Categoría', 'Subido por', 'Acciones']}>
      {items.map((item) => (
        <tr key={item.id}>
          <Td strong>{item.nombre}<Small>{item.descripcion}</Small></Td>
          <Td>{item.archivo_tipo}</Td>
          <Td>{item.categoria}</Td>
          <Td>{item.usuarios?.nombre || '--'}</Td>
          <Td>
            <div className="flex flex-wrap gap-2">
              <Button className="btn-success" onClick={() => run(() => admin.approveResource(item.id))}><Check size={15} /> Aprobar</Button>
              <Button className="btn-danger" onClick={() => window.confirm('¿Rechazar recurso?') && run(() => admin.rejectResource(item.id))}><Trash2 size={15} /> Rechazar</Button>
            </div>
          </Td>
        </tr>
      ))}
    </PanelTable>
  )
}

function PublishedTable({ items, admin, run, onEdit }) {
  return (
    <PanelTable title="Recursos publicados" empty="No hay recursos publicados." headers={['Nombre', 'Tipo', 'Categoría', 'Descargas', 'Subido por', 'Acciones']}>
      {items.map((item) => (
        <tr key={item.id}>
          <Td strong>{item.nombre}<Small>{item.descripcion}</Small></Td>
          <Td>{item.archivo_tipo}</Td>
          <Td>{item.categoria}</Td>
          <Td>{item.descargas || 0}</Td>
          <Td>{item.usuarios?.nombre || '--'}</Td>
          <Td>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onEdit(item)}><Edit3 size={15} /> Editar</Button>
              <Button className="btn-danger" onClick={() => window.confirm('¿Eliminar recurso publicado?') && run(() => admin.deletePublished(item.id))}><Trash2 size={15} /> Eliminar</Button>
            </div>
          </Td>
        </tr>
      ))}
    </PanelTable>
  )
}

function UsersTable({ items, admin, run }) {
  const canManageRoles = admin.isSuperAdmin

  return (
    <PanelTable title="Gestión de usuarios" empty="No hay usuarios." headers={['Nombre', 'Email', 'Rol', 'Registro', 'Acciones']}>
      {items.map((item) => (
        <tr key={item.id}>
          <Td strong>{item.nombre}</Td>
          <Td>{item.email}</Td>
          <Td><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">{item.rol}</span></Td>
          <Td>{formatDate(item.created_at)}</Td>
          <Td>
            {canManageRoles && item.rol !== 'superadmin' ? (
              <Button onClick={() => run(() => admin.toggleUserRole(item.id, item.rol))}>
                <Users size={15} /> {item.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
              </Button>
            ) : (
              <span className="text-xs text-slate-500">Solo SuperAdmin</span>
            )}
          </Td>
        </tr>
      ))}
    </PanelTable>
  )
}

function PanelTable({ title, headers, children, empty }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <div>
      <h2 className="mb-5 text-xl font-black text-white sm:text-2xl">{title}</h2>
      <div className="-mx-1 overflow-x-auto rounded-[1.5rem] border border-white/10 sm:mx-0">
        <Table headers={headers}>
          {hasRows ? children : <tr><Td colSpan={headers.length}>{empty}</Td></tr>}
        </Table>
      </div>
    </div>
  )
}

function Table({ headers, children }) {
  return (
    <table className="min-w-[720px] text-left text-sm sm:min-w-full">
      <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-500">
        <tr>{headers.map((header) => <th key={header} className="px-3 py-3 sm:px-4">{header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-white/10 text-slate-200">{children}</tbody>
    </table>
  )
}

function Td({ children, strong, colSpan }) {
  return <td colSpan={colSpan} className={`max-w-72 break-words px-3 py-4 align-top sm:px-4 ${strong ? 'font-bold text-white' : ''}`}>{children}</td>
}

function Small({ children }) {
  return <span className="mt-1 line-clamp-1 block max-w-md text-xs font-normal text-slate-500">{children}</span>
}

function Stat({ label, value }) {
  return (
    <SpotlightCard className="p-5">
      <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      <AnimatedCounter value={value} className="mt-2 block text-3xl font-black text-white sm:text-4xl" />
    </SpotlightCard>
  )
}
