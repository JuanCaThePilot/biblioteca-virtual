import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

export function AnimatedCounter({ value = 0, className = '' }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest).toString())

  useEffect(() => {
    const controls = animate(count, Number(value) || 0, { duration: 0.8, ease: 'easeOut' })
    return controls.stop
  }, [count, value])

  return <motion.span className={className}>{rounded}</motion.span>
}
