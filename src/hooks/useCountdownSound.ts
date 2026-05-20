import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import type { Synth } from 'tone'

// cubic ease-in: perceptible early acceleration, builds strongly through the back half
function cubicEaseIn(t: number): number {
  return Math.pow(t, 3)
}

// Returns scheduled beep times (in seconds from t=0) for a 20-second acceleration
function buildBeepSchedule(): number[] {
  const BPM_START = 100
  const BPM_END = 750
  const TOTAL = 20
  const times: number[] = []
  let t = 0

  while (t < TOTAL) {
    times.push(t)
    const progress = t / TOTAL
    const eased = cubicEaseIn(progress)
    const bpm = BPM_START + (BPM_END - BPM_START) * eased
    const interval = 60 / bpm
    t += interval
  }

  return times
}

const BEEP_TIMES = buildBeepSchedule()

// Call this inside a user-gesture handler (tap/click) to unlock the AudioContext
// on mobile before the countdown starts. Returns a Promise for callers that await it.
export function primeAudioContext(): Promise<void> {
  return Tone.start()
}

// Play a single preview beep at the given volume level (same square-wave synth as countdown).
export async function playPreviewBeep(volumeDb: number): Promise<void> {
  await Tone.start()
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.08, sustain: 0, release: 0.003 },
    volume: -30 + volumeDb,
  }).toDestination()
  synth.triggerAttackRelease(440, '16n')
  setTimeout(() => synth.dispose(), 500)
}

// Module-level thud state — survives HoldCounter unmounting when celebrate phase starts
let moduleThudSynth: Synth | null = null
let moduleThudTimer: ReturnType<typeof setTimeout> | null = null

function scheduleThud(fireAt: number, volumeDb: number) {
  if (moduleThudTimer) clearTimeout(moduleThudTimer)
  moduleThudSynth?.dispose()

  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.001, sustain: 1, release: 0.6 },
    volume: -15 + volumeDb,
  }).toDestination()
  moduleThudSynth = synth
  synth.triggerAttackRelease(120, 0.9, fireAt)

  const wallMsUntilFire = (fireAt - Tone.now()) * 1000
  moduleThudTimer = setTimeout(() => {
    moduleThudSynth?.dispose()
    moduleThudSynth = null
    moduleThudTimer = null
  }, wallMsUntilFire + 1800)
}

function cancelThud() {
  if (moduleThudTimer) { clearTimeout(moduleThudTimer); moduleThudTimer = null }
  moduleThudSynth?.dispose()
  moduleThudSynth = null
}

export function useCountdownSound(seconds: number, isPaused: boolean, volumeDb: number = 0) {
  const synthRef = useRef<Synth | null>(null)
  const scheduledRef = useRef(false)

  // When seconds reaches 1, schedule the full 20-second beep + thud sequence.
  // AudioContext is already running because primeAudioContext() was awaited on
  // the LET'S GO tap — no .then() wrapper needed.
  useEffect(() => {
    if (seconds !== 1) return
    if (scheduledRef.current) return
    scheduledRef.current = true

    const now = Tone.now() + 0.05

    const beepSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.003, decay: 0.03, sustain: 0, release: 0.003 },
      volume: -30 + volumeDb,
    }).toDestination()
    synthRef.current = beepSynth

    for (const t of BEEP_TIMES) {
      const progress = Math.min(t / 20, 1)
      const eased = cubicEaseIn(progress)
      const hz = 200 + (900 - 200) * eased
      beepSynth.triggerAttackRelease(hz, '64n', now + t)
    }

    // Audio starts at seconds=1, so 19 more seconds = wall-clock second 20
    scheduleThud(now + 19, volumeDb)
  }, [seconds])

  // Cancel beep synth when paused; cancel thud too if paused mid-sequence
  useEffect(() => {
    if (!isPaused && seconds !== 0) return
    if (!scheduledRef.current) return

    synthRef.current?.dispose()
    synthRef.current = null
    if (isPaused) cancelThud()
    scheduledRef.current = false
  }, [isPaused, seconds])

  // On unmount only clean up the beep synth — thud lives at module scope
  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [])
}
