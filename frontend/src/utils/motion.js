export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08
    }
  }
}

export const spring = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
  mass: 0.7
}

export const viewport = {
  once: true,
  amount: 0.18,
  margin: '0px 0px -80px 0px'
}

export const slideLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0 }
}

export const slideRight = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0 }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 }
}

export const pageTransition = {
  initial: { opacity: 0, y: 18, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -14, filter: 'blur(8px)' },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
}
