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

function Stars({ count }: { count: number }) {
  return (
    <div className="stars">
      {'⭐'.repeat(count)}{'☆'.repeat(3 - count)}
    </div>
  )
}

export default function PoseCard({ pose, poseImage, poseNumber, totalPoses, onReady }: PoseCardProps) {
  return (
    <motion.div
      className="screen"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span className="progress-pill">Pose {poseNumber} of {totalPoses}</span>

        <img
          src={poseImage}
          alt={pose.englishName}
          style={{
            width: '100%',
            maxHeight: '38vh',
            objectFit: 'contain',
            borderRadius: 16,
            background: '#f8f6ff',
          }}
        />

        <h2
          style={{
            fontSize: 'clamp(28px, 8vw, 38px)',
            fontWeight: 900,
            color: '#1a1a2e',
            margin: '4px 0 0',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {pose.englishName}
        </h2>

        <p
          style={{
            fontSize: 14,
            fontStyle: 'italic',
            color: '#888',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {pose.sanskritName}
        </p>

        <Stars count={pose.difficulty} />

        <p
          style={{
            fontSize: 15,
            color: '#555',
            textAlign: 'center',
            margin: '4px 0 8px',
            lineHeight: 1.5,
          }}
        >
          {pose.description}
        </p>

        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 18, borderRadius: 14 }}
          onClick={onReady}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          LET'S GO! 🚀
        </motion.button>
      </div>
    </motion.div>
  )
}
