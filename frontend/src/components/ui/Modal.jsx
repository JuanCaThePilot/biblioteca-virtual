import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({ open, title, onClose, children, maxWidth = 'max-w-xl' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className={`glass-strong max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-[2rem] p-6`}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <button className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
