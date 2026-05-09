import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function Magnetic({ children, strength = 0.22, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })

  function onPointerMove(event) {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * strength)
    y.set((event.clientY - rect.top - rect.height / 2) * strength)
  }

  function onPointerLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div className={className} style={{ x, y }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </motion.div>
  )
}
