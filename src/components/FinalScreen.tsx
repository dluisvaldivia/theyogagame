import { motion } from 'framer-motion'

interface FinalScreenProps {
  onRestart: () => void
}

const variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
}

export default function FinalScreen({ onRestart }: FinalScreenProps) {
  return (
    <motion.div
      className="screen"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="card" style={{ textAlign: 'center', gap: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>🎉</div>

        <h2
          style={{
            fontSize: 'clamp(28px, 8vw, 40px)',
            fontWeight: 900,
            color: '#1a1a2e',
            margin: '8px 0 4px',
          }}
        >
          You did it!
        </h2>

        <p style={{ fontSize: 16, color: '#555', margin: '0 0 8px', lineHeight: 1.5 }}>
          Amazing work! You completed all<br />
          <strong>5 yoga poses</strong> like a champion!
        </p>

        <div style={{ fontSize: 36, letterSpacing: 4, margin: '4px 0 16px' }}>
          ⭐⭐⭐⭐⭐
        </div>

        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 18, borderRadius: 14 }}
          onClick={onRestart}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          PLAY AGAIN 🔄
        </motion.button>
      </div>
    </motion.div>
  )
}
