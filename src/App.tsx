import { useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import posesData from './data/poses.json'
import { poseImageMap } from './assets/imageMap'
import IntroScreen from './components/IntroScreen'
import PoseCard from './components/PoseCard'
import CountdownScreen from './components/CountdownScreen'
import HoldCounter from './components/HoldCounter'
import CelebrationFlash from './components/CelebrationFlash'
import FinalScreen from './components/FinalScreen'

type GamePhase = 'intro' | 'pose' | 'countdown' | 'holding' | 'celebrate' | 'final'

const CELEBRATION_EMOJIS = ['🎉', '🥳', '⭐', '🌟', '💪', '🎊', '👏', '🏆', '✨', '🙌']

function randomEmoji() {
  return CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)]
}

const poses = posesData.poses

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [poseIndex, setPoseIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [holdSeconds, setHoldSeconds] = useState(0)
  const [bgImageVisible, setBgImageVisible] = useState(false)
  const [celebrationEmoji, setCelebrationEmoji] = useState('')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const poseIndexRef = useRef(0)
  const holdSecondsRef = useRef(0)
  const isPausedRef = useRef(false)

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const advanceToNextPose = useCallback(() => {
    clearTimer()
    // Show celebration emoji first
    setCelebrationEmoji(randomEmoji())
    setPhase('celebrate')
    const nextIndex = poseIndexRef.current + 1
    setTimeout(() => {
      holdSecondsRef.current = 0
      setHoldSeconds(0)
      setIsPaused(false)
      isPausedRef.current = false
      setBgImageVisible(false)
      if (nextIndex >= poses.length) {
        setPhase('final')
      } else {
        poseIndexRef.current = nextIndex
        setPoseIndex(nextIndex)
        setPhase('pose')
      }
    }, 1400)
  }, [])

  const startInterval = useCallback(() => {
    holdSecondsRef.current = 0
    setHoldSeconds(0)
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return
      holdSecondsRef.current += 1
      setHoldSeconds(holdSecondsRef.current)
      if (holdSecondsRef.current >= 20) {
        advanceToNextPose()
      }
    }, 1000)
  }, [advanceToNextPose])

  // Handlers
  function handleStart() {
    poseIndexRef.current = 0
    setPoseIndex(0)
    setPhase('pose')
  }

  function handlePoseReady() {
    setBgImageVisible(false)
    setPhase('countdown')
  }

  const handleCountdownShowImage = useCallback(() => {
    setBgImageVisible(true)
  }, [])

  const handleCountdownDone = useCallback(() => {
    setPhase('holding')
    startInterval()
  }, [startInterval])

  function handlePause() {
    isPausedRef.current = true
    setIsPaused(true)
  }

  function handlePlay() {
    isPausedRef.current = false
    setIsPaused(false)
  }

  function handleRestart() {
    clearTimer()
    holdSecondsRef.current = 0
    poseIndexRef.current = 0
    setHoldSeconds(0)
    setPoseIndex(0)
    setIsPaused(false)
    isPausedRef.current = false
    setBgImageVisible(false)
    setPhase('intro')
  }

  const currentPose = poses[poseIndex]
  const showBgImage = bgImageVisible && (phase === 'countdown' || phase === 'holding' || phase === 'celebrate')

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100svh' }}>
      {/* Persistent pose background image — never unmounts during countdown→holding */}
      <motion.img
        src={poseImageMap[currentPose.id]}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: showBgImage ? 0.25 : 0 }}
        transition={{ duration: 0.8, ease: 'easeIn' as const }}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <IntroScreen key="intro" onStart={handleStart} />
        )}

        {phase === 'pose' && (
          <PoseCard
            key={`pose-${poseIndex}`}
            pose={currentPose}
            poseImage={poseImageMap[currentPose.id]}
            poseNumber={poseIndex + 1}
            totalPoses={poses.length}
            onReady={handlePoseReady}
          />
        )}

        {phase === 'countdown' && (
          <CountdownScreen
            key="countdown"
            onComplete={handleCountdownDone}
            onShowImage={handleCountdownShowImage}
          />
        )}

        {phase === 'holding' && (
          <HoldCounter
            key={`holding-${poseIndex}`}
            seconds={holdSeconds}
            isPaused={isPaused}
            onPause={handlePause}
            onPlay={handlePlay}
          />
        )}

        {phase === 'celebrate' && (
          <CelebrationFlash key={`celebrate-${poseIndex}`} emoji={celebrationEmoji} />
        )}

        {phase === 'final' && (
          <FinalScreen key="final" onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  )
}
