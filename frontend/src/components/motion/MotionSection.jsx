import { motion } from 'framer-motion'
import { fadeUp, stagger, viewport } from '../../utils/motion'

export function MotionSection({ children, className = '', as = 'section', delay = 0 }) {
  const Component = motion[as] || motion.section

  return (
    <Component
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  )
}

export function Reveal({ children, className = '', variant = fadeUp, delay = 0 }) {
  return (
    <motion.div
      variants={variant}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
