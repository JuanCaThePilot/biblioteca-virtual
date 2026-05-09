import { motion } from 'framer-motion'

export function Button({ className = '', children, ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
