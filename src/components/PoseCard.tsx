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

export default function PoseCard({ pose, poseImage, poseNumber, totalPoses, onReady }: PoseCardProps) {
  return (
    <motion.div
      className="screen"
      role="region"
      aria-label={`Pose ${poseNumber} of ${totalPoses}: ${pose.englishName}`}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px, 1.4vh, 12px)' }}>
        <span className="progress-pill">{poseNumber} / {totalPoses}</span>

        <img
          src={poseImage}
          alt={`${pose.englishName} pose`}
          style={{
            width: '100%',
            maxHeight: '50%',
            objectFit: 'contain',
            borderRadius: 16,
            background: '#f8f6ff',
          }}
        />

        <h2
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
            textAlign: 'center',
          }}
        >
          {pose.sanskritName}
        </p>

        <LevelBar difficulty={pose.difficulty as 1 | 2 | 3} />

        <p
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
          style={{ width: '100%', fontSize: 18, borderRadius: 14, marginTop: 4 }}
          onClick={onReady}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          GO▶️
        </motion.button>
      </div>
    </motion.div>
  )
}
