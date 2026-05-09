import { motion } from 'framer-motion'

interface IntroScreenProps {
  onStart: (mode: 'solo' | 'duo') => void
}

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.3, ease: 'easeIn' as const } },
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <motion.div
      className="screen"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8 }}>🧘</div>
        <h1
          style={{
            fontSize: 'clamp(42px, 12vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 16px rgba(0,0,0,0.25)',
            margin: '0 0 8px',
            letterSpacing: '-1px',
          }}
        >
          YOGA<br />BUDDY
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            textShadow: '0 1px 8px rgba(0,0,0,0.2)',
            margin: 0,
          }}
        >
          5 poses · Hold each one · Have fun!
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <motion.button
          className="btn btn-primary"
          style={{ fontSize: 18, padding: '16px 36px', borderRadius: 60 }}
          onClick={() => onStart('solo')}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.04 }}
        >
          1 PLAYER
        </motion.button>
        <motion.button
          className="btn btn-primary"
          style={{ fontSize: 18, padding: '16px 36px', borderRadius: 60 }}
          onClick={() => onStart('duo')}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.04 }}
        >
          👥 2 PLAYERS
        </motion.button>
      </div>
    </motion.div>
  )
}
