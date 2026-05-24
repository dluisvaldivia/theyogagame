import { motion } from 'framer-motion'
import earImg from '../assets/ear (2).png'
import { playPreviewBeep } from '../hooks/useCountdownSound'

interface IntroScreenProps {
  onStart: (mode: 'solo' | 'duo') => void
  volume: number
  onVolumeChange: (v: number) => void
}

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.3, ease: 'easeIn' as const } },
}

const VOLUME_OPTIONS = [
  { label: 'LOW', value: 0, aria: 'Low volume', fontSize: 13, padding: '7px 14px' },
  { label: 'MED', value: 18, aria: 'Medium volume', fontSize: 16, padding: '9px 18px' },
  { label: 'HIGH', value: 36, aria: 'High volume', fontSize: 20, padding: '11px 22px' },
]

export default function IntroScreen({ onStart, volume, onVolumeChange }: IntroScreenProps) {
  return (
    <motion.div
      className="screen"
      role="region"
      aria-label="Home"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 216, lineHeight: 1, marginBottom: 8 }}>🧘</div>
        <h1
          style={{
            fontSize: 'clamp(22px, 9vw, 52px)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 16px rgba(0,0,0,0.25)',
            margin: '0 0 8px',
            letterSpacing: '-1px',
            whiteSpace: 'nowrap',
          }}
        >
          THE YOGA GAME
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, gap: 10 }}>
        <img src={earImg} alt="" aria-hidden="true" style={{ width: 36, height: 36, objectFit: 'contain', opacity: 0.85 }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          {VOLUME_OPTIONS.map(({ label, value, aria, fontSize, padding }) => {
            const active = volume === value
            return (
              <motion.button
                key={value}
                aria-label={aria}
                onClick={() => { onVolumeChange(value); playPreviewBeep(value) }}
                whileTap={{ scale: 0.93 }}
                style={{
                  padding,
                  borderRadius: 40,
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: active ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: active ? '#333' : 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  fontSize,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {label}
              </motion.button>
            )
          })}
        </div>
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
          2 PLAYERS
        </motion.button>
      </div>

      <a
        href="https://dluisvaldivia.github.io/DVPortfolio/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          fontWeight: 500,
        }}
      >
        Made by Danny Valdivia
      </a>
    </motion.div>
  )
}
