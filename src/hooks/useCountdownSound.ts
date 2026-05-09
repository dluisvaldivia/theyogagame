import { useEffect, useRef } from 'react'

// Tone.js is loaded from CDN — declare minimal types we need
declare global {
  interface Window {
    Tone?: {
      start: () => Promise<void>
      getContext: () => { state: string }
      Synth: new (options: object) => ToneSynth
      gainToDb: (gain: number) => number
      now: () => number
      Transport: { cancel: (time?: number) => void }
      getTransport: () => { cancel: (time?: number) => void }
    }
  }
}

interface ToneSynth {
  triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => void
  toDestination: () => ToneSynth
  dispose: () => void
}

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

// Module-level thud state — survives HoldCounter unmounting when celebrate phase starts
let moduleThudSynth: ToneSynth | null = null
let moduleThudTimer: ReturnType<typeof setTimeout> | null = null

function scheduleThud(Tone: NonNullable<Window['Tone']>, fireAt: number) {
  // Cancel any leftover thud from a previous pose
  if (moduleThudTimer) clearTimeout(moduleThudTimer)
  moduleThudSynth?.dispose()

  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.001, sustain: 1, release: 0.6 },
    volume: Tone.gainToDb(0.18),
  }).toDestination()
  moduleThudSynth = synth
  // duration=0.9s holds full volume; release=0.6s fades out → total 1.5s
  synth.triggerAttackRelease(120, 0.9, fireAt)

  // Dispose well after the 1.5s note finishes
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

export function useCountdownSound(seconds: number, isPaused: boolean) {
  const synthRef = useRef<ToneSynth | null>(null)
  const scheduledRef = useRef(false)
  const toneLoadedRef = useRef(false)

  // Load Tone.js from CDN once
  useEffect(() => {
    if (window.Tone) { toneLoadedRef.current = true; return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'
    script.onload = () => { toneLoadedRef.current = true }
    document.head.appendChild(script)
  }, [])

  // When seconds reaches 1, schedule the full 20-second beep + thud sequence
  useEffect(() => {
    if (seconds !== 1) return
    if (scheduledRef.current) return
    if (!toneLoadedRef.current || !window.Tone) return

    const Tone = window.Tone
    Tone.start().then(() => {
      scheduledRef.current = true
      const now = Tone.now() + 0.05

      // Beep synth — square-wave tick
      const beepSynth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.003, decay: 0.03, sustain: 0, release: 0.003 },
        volume: Tone.gainToDb(0.03),
      }).toDestination()
      synthRef.current = beepSynth

      // Schedule every beep — pitch rises on the same cubic ease-in as BPM
      for (const t of BEEP_TIMES) {
        const progress = Math.min(t / 20, 1)
        const eased = cubicEaseIn(progress)
        const hz = 200 + (900 - 200) * eased
        beepSynth.triggerAttackRelease(hz, '64n', now + t)
      }

      // Audio starts at seconds=1, so 19 more seconds = wall-clock second 20
      scheduleThud(Tone, now + 19)
    })
  }, [seconds])

  // Cancel beep synth when paused; cancel everything if paused
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
