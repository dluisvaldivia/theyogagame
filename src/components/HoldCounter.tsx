import { motion, AnimatePresence } from 'framer-motion'
import { useCountdownSound } from '../hooks/useCountdownSound'

interface HoldCounterProps {
  seconds: number
  isPaused: boolean
  onPause: () => void
  onPlay: () => void
}

function getCounterStyle(seconds: number): { color: string; opacity: number } {
  let color: string
  if (seconds <= 6) color = '#FFFFFF'
  else if (seconds <= 11) color = '#FFE135'
  else if (seconds <= 16) color = '#FF8C00'
  else color = '#FF2020'

  const opacity = 1.0 - ((seconds - 1) / 19) * 0.7
  return { color, opacity }
}

const screenVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
}

export default function HoldCounter({ seconds, isPaused, onPause, onPlay }: HoldCounterProps) {
  useCountdownSound(seconds, isPaused)
  const style = getCounterStyle(Math.max(1, seconds))

  return (
    <motion.div
      className="screen"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ gap: 0, position: 'relative', zIndex: 1 }}
    >
      {/* Hold label */}
      <p
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 700,
          fontSize: 18,
          textShadow: '0 1px 8px rgba(0,0,0,0.2)',
          margin: '0 0 8px',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {isPaused ? 'PAUSED' : 'HOLD IT!'}
      </p>

      {/* Big number */}
      <div
        style={{
          height: '42vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={seconds}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: style.opacity, transition: { type: 'spring' as const, stiffness: 350, damping: 22 } }}
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.15 } }}
            style={{
              fontSize: 'clamp(120px, 30vw, 240px)',
              fontWeight: 900,
              color: style.color,
              WebkitTextStroke: '3px rgba(0,0,0,0.55)',
              paintOrder: 'stroke fill',
              textShadow: `0 0 40px ${style.color}, 0 0 80px ${style.color}66, 0 4px 12px rgba(0,0,0,0.6)`,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {seconds}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar — only shown once counting starts to avoid backwards animation */}
      <div
        style={{
          width: '80%',
          maxWidth: 320,
          height: 6,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 3,
          marginBottom: 32,
          overflow: 'hidden',
        }}
      >
        {seconds >= 1 && (
          <motion.div
            style={{
              height: '100%',
              background: style.color,
              borderRadius: 3,
              originX: 0,
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${(seconds / 20) * 100}%` }}
            transition={{ duration: 0.9, ease: 'linear' as const }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <motion.button
          className="btn btn-secondary"
          onClick={isPaused ? onPlay : onPause}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
        </motion.button>
      </div>
    </motion.div>
  )
}
