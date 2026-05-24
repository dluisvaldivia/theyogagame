import { useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import posesData from './data/poses.json'
import { poseImageMap } from './assets/imageMap'
import IntroScreen from './components/IntroScreen'
import PoseCard from './components/PoseCard'
import CountdownScreen from './components/CountdownScreen'
import HoldCounter from './components/HoldCounter'
import { primeAudioContext } from './hooks/useCountdownSound'
import CelebrationFlash from './components/CelebrationFlash'
import FinalScreen from './components/FinalScreen'

type GamePhase = 'intro' | 'pose' | 'countdown' | 'holding' | 'celebrate' | 'final'
type GameMode = 'solo' | 'duo'
type Pose = typeof posesData.poses[number]

const CELEBRATION_EMOJIS = ['🎉', '🥳', '⭐', '🌟', '💪', '👏', '🏆', '✨']

function randomEmoji() {
  return CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)]
}

function pickRandomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function selectGamePoses(mode: GameMode): Pose[] {
  const allPoses = posesData.poses
  const used = new Set<number>()

  function pick(pool: Pose[]): Pose {
    const available = pool.filter(p => !used.has(p.id))
    const pose = pickRandomFrom(available)
    used.add(pose.id)
    return pose
  }

  if (mode === 'solo') {
    const soloPool = allPoses.filter(p => !('twoPlayers' in p && p.twoPlayers))
    const easy = soloPool.filter(p => p.difficulty === 1)
    const medium = soloPool.filter(p => p.difficulty === 2)
    const hard = soloPool.filter(p => p.difficulty === 3)
    return [pick(easy), pick(easy), pick(medium), pick(medium), pick(hard)]
  }

  // duo: 2 two-player poses + 1 easy + 1 medium + 1 hard single-player, sorted by difficulty
  const twoPlayerPool = allPoses.filter(p => 'twoPlayers' in p && p.twoPlayers)
  const singlePool = allPoses.filter(p => !('twoPlayers' in p && p.twoPlayers))
  const easy = singlePool.filter(p => p.difficulty === 1)
  const medium = singlePool.filter(p => p.difficulty === 2)
  const hard = singlePool.filter(p => p.difficulty === 3)

  const selected = [
    pick(twoPlayerPool),
    pick(twoPlayerPool),
    pick(easy),
    pick(medium),
    pick(hard),
  ]
  return [...selected].sort((a, b) => a.difficulty - b.difficulty)
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [poses, setPoses] = useState<Pose[]>(() => selectGamePoses('solo'))
  const [poseIndex, setPoseIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [holdSeconds, setHoldSeconds] = useState(0)
  const [bgImageVisible, setBgImageVisible] = useState(false)
  const [celebrationEmoji, setCelebrationEmoji] = useState('')
  const [volume, setVolume] = useState(0)

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
  }, [poses.length])

  const startInterval = useCallback(() => {
    holdSecondsRef.current = 0
    setHoldSeconds(0)
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return
      holdSecondsRef.current += 1
      setHoldSeconds(holdSecondsRef.current)
      if (holdSecondsRef.current >= 20) {
        clearTimer()
        setTimeout(() => advanceToNextPose(), 1000)
      }
    }, 1000)
  }, [advanceToNextPose])

  function handleStart(mode: GameMode) {
    poseIndexRef.current = 0
    setPoseIndex(0)
    setPoses(selectGamePoses(mode))
    setPhase('pose')
  }

  async function handlePoseReady() {
    await primeAudioContext()
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
    <main
      aria-label="That Yoga Game"
      style={{ position: 'relative', width: '100%', minHeight: '100svh' }}
    >
      {/* Screen-reader live region — announces phase transitions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {phase === 'intro' && 'That Yoga Game home screen'}
        {phase === 'pose' && `Pose ${poseIndex + 1} of ${poses.length}: ${currentPose.englishName}`}
        {phase === 'countdown' && 'Get in position, countdown starting'}
        {phase === 'holding' && 'Hold the pose, timer running'}
        {phase === 'celebrate' && 'Great job! Moving to next pose'}
        {phase === 'final' && 'You completed all poses!'}
      </div>

      {/* Persistent pose background image — never unmounts during countdown→holding */}
      <motion.img
        src={poseImageMap[currentPose.id]}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: showBgImage ? 0.70 : 0 }}
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
          <IntroScreen key="intro" onStart={handleStart} volume={volume} onVolumeChange={setVolume} />
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
            volume={volume}
          />
        )}

        {phase === 'celebrate' && (
          <CelebrationFlash key={`celebrate-${poseIndex}`} emoji={celebrationEmoji} />
        )}

        {phase === 'final' && (
          <FinalScreen key="final" onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </main>
  )
}
