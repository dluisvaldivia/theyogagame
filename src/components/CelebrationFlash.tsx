import { motion } from 'framer-motion'

interface CelebrationFlashProps {
  emoji: string
}

export default function CelebrationFlash({ emoji }: CelebrationFlashProps) {
  return (
    <motion.div
      className="screen"
      role="region"
      aria-label="Celebration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      style={{ gap: 0, position: 'relative', zIndex: 1 }}
    >
      <motion.div
        aria-hidden="true"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{
          scale: [0.2, 1.3, 1],
          opacity: 1,
          transition: { duration: 0.45, times: [0, 0.6, 1], ease: 'easeOut' as const },
        }}
        style={{ fontSize: 'clamp(80px, 25vw, 160px)', lineHeight: 1, userSelect: 'none' }}
      >
        {emoji}
      </motion.div>
    </motion.div>
  )
}
