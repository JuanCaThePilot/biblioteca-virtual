import { motion } from 'framer-motion'

export function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={`glass rounded-[1.75rem] ${className}`}
    >
      {children}
    </motion.div>
  )
}
