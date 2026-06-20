import { motion } from 'framer-motion'

interface Pose {
  id: number
  englishName: string
  sanskritName: string
  difficulty: number
  description: string
}

interface PoseCardProps {
  pose: Pose
  poseImage: string
  poseNumber: number
  totalPoses: number
  onReady: () => void
  onHome: () => void
  holdDuration: number
  onHoldDurationChange: (d: number) => void
}

const variants = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -80, transition: { duration: 0.3, ease: 'easeIn' as const } },
}

const LEVEL_CONFIG = {
  1: { label: 'Easy', color: '#22c55e', pct: 33 },
  2: { label: 'Medium', color: '#eab308', pct: 66 },
  3: { label: 'Hard', color: '#ef4444', pct: 100 },
} as const

function LevelBar({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  const cfg = LEVEL_CONFIG[difficulty]
  return (
    <div className="level-bar-wrap">
      <span className="level-label" style={{ color: cfg.color, textAlign: 'center' }}>{cfg.label}</span>
      <div className="level-bar-track">
        <div
          className="level-bar-fill"
          style={{ width: `${cfg.pct}%`, background: cfg.color }}
        />
      </div>
    </div>
  )
}

const DURATION_OPTIONS = [30, 45, 60]

export default function PoseCard({ pose, poseImage, poseNumber, totalPoses, onReady, onHome, holdDuration, onHoldDurationChange }: PoseCardProps) {
  return (
    <motion.div
      className="screen"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px, 1.4vh, 12px)', overflowY: 'auto' }}>
        <span className="progress-pill">{poseNumber} / {totalPoses}</span>

        <img
          src={poseImage}
          alt={`${pose.englishName} pose`}
          style={{
            width: '100%',
            maxHeight: 'clamp(120px, 24svh, 260px)',
            objectFit: 'contain',
            borderRadius: 16,
            background: '#f8f6ff',
          }}
        />

        <h2
          tabIndex={0}
          style={{
            fontSize: 'clamp(24px, 7vw, 36px)',
            fontWeight: 900,
            color: '#1a1a2e',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {pose.englishName}
        </h2>

        <p
          style={{
            fontSize: 13,
            fontStyle: 'italic',
            color: '#888',
            margin: 0,
            marginTop: 'clamp(-8px, -1.2vh, -4px)',
            textAlign: 'center',
          }}
        >
          {pose.sanskritName}
        </p>

        <LevelBar difficulty={pose.difficulty as 1 | 2 | 3} />

        <p
          tabIndex={0}
          style={{
            fontSize: 14,
            color: '#555',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {pose.description}
        </p>

        <motion.button
          className="btn btn-primary"
          aria-label="Start the game"
          style={{ width: '100%', fontSize: 'clamp(18px, 4svh, 30px)', padding: 'clamp(10px, 2svh, 20px) 48px', borderRadius: 14, marginTop: 4 }}
          onClick={onReady}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          GO <span aria-hidden="true">▶️</span>
        </motion.button>

        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 32px)', justifyContent: 'center', marginTop: 'clamp(2px, 1svh, 8px)' }}>
          {DURATION_OPTIONS.map(d => (
            <motion.button
              key={d}
              aria-label={`${d} seconds`}
              className={`btn btn-secondary${holdDuration === d ? ' btn-duration-selected' : ''}`}
              onClick={() => onHoldDurationChange(d)}
              whileTap={{ scale: 0.95 }}
              style={{
                fontSize: 15,
                padding: '10px 16px',
                whiteSpace: 'nowrap',
              }}
            >
              {d} <span aria-hidden="true">⏳</span>
            </motion.button>
          ))}
        </div>
        <motion.button
          className="btn btn-secondary"
          aria-label="Home"
          onClick={onHome}
          whileTap={{ scale: 0.95 }}
          style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, lineHeight: 1.2, marginTop: 'clamp(4px, 1svh, 12px)', alignSelf: 'center' }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.2em' }}>🏠</span>
          <span aria-hidden="true" style={{ fontSize: '0.7em', letterSpacing: '0.08em', opacity: 0.85 }}>HOME</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
