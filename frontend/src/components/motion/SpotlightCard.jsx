import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

export function SpotlightCard({ children, className = '', disabled = false, ...props }) {
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const background = useMotionTemplate`radial-gradient(520px circle at ${mouseX}% ${mouseY}%, rgba(124,92,255,0.24), transparent 42%)`

  function onPointerMove(event) {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set(((event.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((event.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      whileHover={disabled ? undefined : { y: -7, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={`group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] shadow-glass backdrop-blur-2xl ${className}`}
      {...props}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background }} />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
