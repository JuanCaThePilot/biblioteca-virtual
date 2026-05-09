import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'

export function AmbientBackground() {
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(124,92,255,0.18), transparent 28%)`

  useEffect(() => {
    function onMove(event) {
      mouseX.set((event.clientX / window.innerWidth) * 100)
      mouseY.set((event.clientY / window.innerHeight) * 100)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mouseX, mouseY])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden aurora mesh-grid">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />
      <motion.div
        className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-violet/30 blur-3xl"
        animate={{ x: [0, 60, 20], y: [0, 30, 80], scale: [1, 1.16, 0.96] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-12rem] top-32 h-[30rem] w-[30rem] rounded-full bg-cyan/20 blur-3xl"
        animate={{ x: [0, -50, -20], y: [0, 70, 20], scale: [1, 0.9, 1.12] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-16rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-emerald-400/10 blur-3xl"
        animate={{ x: [0, 40, -40], y: [0, -60, -30] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
    </div>
  )
}
