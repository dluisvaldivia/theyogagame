import { motion, AnimatePresence } from 'framer-motion'
import { useCountdownSound } from '../hooks/useCountdownSound'

interface HoldCounterProps {
  seconds: number
  isPaused: boolean
  onPause: () => void
  onPlay: () => void
  onHome: () => void
  volume: number
  holdDuration: number
}

function getCounterStyle(seconds: number, holdDuration: number): { color: string; opacity: number } {
  const pct = (seconds - 1) / (holdDuration - 1)
  let color: string
  if (pct < 0.3) color = '#FFFFFF'
  else if (pct < 0.55) color = '#FFE135'
  else if (pct < 0.8) color = '#FF8C00'
  else color = '#FF2020'

  const opacity = 1.0 - pct * 0.7
  return { color, opacity }
}

const screenVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
}

export default function HoldCounter({ seconds, isPaused, onPause, onPlay, onHome, volume, holdDuration }: HoldCounterProps) {
  useCountdownSound(seconds, isPaused, volume, holdDuration)

  const style = getCounterStyle(Math.max(1, seconds), holdDuration)

  return (
    <motion.div
      className="screen"
      role="region"
      aria-label={isPaused ? 'Hold timer paused' : 'Hold the pose'}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ gap: 0, position: 'relative', zIndex: 1, height: '100%', overflowY: 'auto' }}
    >
      {/* Hold label */}
      <h1
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
      </h1>

      {/* Big number */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
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
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: 'clamp(40px, min(20vw, 20svh), 200px)',
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

      {/* Progress bar */}
      <div
        style={{
          width: '88%',
          maxWidth: 400,
          height: 14,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 8,
          marginBottom: 28,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        {seconds >= 1 && (
          <motion.div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${style.color}cc, ${style.color})`,
              borderRadius: 8,
              originX: 0,
              boxShadow: `0 0 12px ${style.color}99`,
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${(seconds / holdDuration) * 100}%` }}
            transition={{ duration: 0.9, ease: 'linear' as const }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px, 2svh, 32px)', width: '100%' }}>
        <motion.button
          className="btn btn-secondary"
          aria-label={isPaused ? 'Play' : 'Pause'}
          onClick={isPaused ? onPlay : onPause}
          whileTap={{ scale: 0.95 }}
          style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, lineHeight: 1.2, fontSize: 'clamp(16px, 4svh, 30px)', padding: 'clamp(8px, 2svh, 20px) clamp(20px, 5vw, 48px)' }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.2em' }}>{isPaused ? '▶' : '⏸'}</span>
          <span aria-hidden="true" style={{ fontSize: '0.7em', letterSpacing: '0.08em', opacity: 0.85 }}>{isPaused ? 'PLAY' : 'PAUSE'}</span>
        </motion.button>
        <motion.button
          className="btn btn-secondary"
          aria-label="Home"
          onClick={onHome}
          whileTap={{ scale: 0.95 }}
          style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, lineHeight: 1.2 }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.2em' }}>🏠</span>
          <span aria-hidden="true" style={{ fontSize: '0.7em', letterSpacing: '0.08em', opacity: 0.85 }}>HOME</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
