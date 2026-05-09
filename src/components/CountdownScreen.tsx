import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownScreenProps {
  onComplete: () => void
  onShowImage: () => void
}

const screenVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

const numberVariants = {
  initial: { scale: 0.3, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
  exit: { scale: 1.5, opacity: 0, transition: { duration: 0.2 } },
}

const STEPS = ['Get in position...', '3', '2', '1', 'GO!']
const DELAYS = [0, 1000, 1900, 2800, 3700]
const DONE_AT = 4600

export default function CountdownScreen({ onComplete, onShowImage }: CountdownScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStepIndex(i)
        // Fire image reveal exactly when "2" appears (stepIndex 2)
        if (i === 2) onShowImage()
      }, DELAYS[i]))
    })

    timers.push(setTimeout(onComplete, DONE_AT))

    return () => timers.forEach(clearTimeout)
  }, [onComplete, onShowImage])

  const label = STEPS[stepIndex]
  const isGo = label === 'GO!'
  const isInstruction = label === 'Get in position...'

  return (
    <motion.div
      className="screen"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ gap: 0, position: 'relative', zIndex: 1 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          variants={numberVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: isInstruction
              ? 'clamp(22px, 6vw, 32px)'
              : 'clamp(100px, 28vw, 220px)',
            fontWeight: 900,
            color: isGo ? '#fff' : 'rgba(255,255,255,0.95)',
            WebkitTextStroke: isInstruction ? 'none' : '3px rgba(0,0,0,0.55)',
            paintOrder: 'stroke fill',
            textShadow: isGo
              ? '0 0 60px rgba(255,255,255,0.9), 0 0 120px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.6)'
              : isInstruction
                ? '0 2px 8px rgba(0,0,0,0.4)'
                : '0 0 40px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.6)',
            textAlign: 'center',
            lineHeight: 1,
            padding: isInstruction ? '0 24px' : 0,
          }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
