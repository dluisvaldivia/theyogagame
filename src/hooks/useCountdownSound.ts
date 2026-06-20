import { useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'
import endSoundUrl from '../assets/endsound.mp3'

// cubic ease-in: perceptible early acceleration, builds strongly through the back half
function cubicEaseIn(t: number): number {
  return Math.pow(t, 3)
}

// Returns scheduled beep times (in seconds from t=0) spanning `total` seconds
function buildBeepSchedule(total: number): number[] {
  const BPM_START = 100
  const BPM_END = 750
  const times: number[] = []
  let t = 0

  while (t < total) {
    times.push(t)
    const progress = t / total
    const eased = cubicEaseIn(progress)
    const bpm = BPM_START + (BPM_END - BPM_START) * eased
    const interval = 60 / bpm
    t += interval
  }

  return times
}

const scheduleCache = new Map<number, number[]>()
function getBeepSchedule(holdDuration: number): number[] {
  if (!scheduleCache.has(holdDuration)) {
    scheduleCache.set(holdDuration, buildBeepSchedule(holdDuration - 1))
  }
  return scheduleCache.get(holdDuration)!
}

let endSoundBuffer: AudioBuffer | null = null

async function preloadEndSound(ctx: AudioContext): Promise<void> {
  if (endSoundBuffer) return
  try {
    const res = await fetch(endSoundUrl)
    const raw = await res.arrayBuffer()
    endSoundBuffer = await ctx.decodeAudioData(raw)
  } catch {}
}

// Call this inside a user-gesture handler (tap/click) to unlock the AudioContext
// on mobile before the countdown starts. Returns a Promise for callers that await it.
export async function primeAudioContext(): Promise<void> {
  await Tone.start()
  const ctx = Tone.getContext().rawContext as unknown as AudioContext
  preloadEndSound(ctx)
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

interface BeepNodes { osc: OscillatorNode; gain: GainNode }

export function useCountdownSound(seconds: number, isPaused: boolean, volumeDb: number = 0, holdDuration: number = 30) {
  const oscRef = useRef<BeepNodes | null>(null)
  const scheduledRef = useRef(false)
  const prevIsPausedRef = useRef(isPaused)
  const volumeDbRef = useRef(volumeDb)
  volumeDbRef.current = volumeDb

  const stopBeeps = useCallback(() => {
    if (oscRef.current) {
      const ctx = Tone.getContext().rawContext as unknown as AudioContext
      const { osc, gain } = oscRef.current
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      try { osc.stop(ctx.currentTime + 0.02) } catch {}
      setTimeout(() => { osc.disconnect(); gain.disconnect() }, 30)
      oscRef.current = null
    }
    scheduledRef.current = false
  }, [])

  // Beep scheduling: fires on first start (seconds===1) and on every resume
  useEffect(() => {
    const justResumed = prevIsPausedRef.current && !isPaused
    prevIsPausedRef.current = isPaused

    if (isPaused) {
      stopBeeps()
      return
    }

    if ((seconds === 1 && !scheduledRef.current) || justResumed) {
      stopBeeps()
      scheduledRef.current = true

      const elapsed = seconds - 1
      const beepTimes = getBeepSchedule(holdDuration)
      const remainingBeeps = beepTimes.filter(t => t >= elapsed)
      const total = holdDuration - 1

      if (remainingBeeps.length > 0) {
        const ctx = Tone.getContext().rawContext as unknown as AudioContext
        const linearVol = Math.min(1, Math.pow(10, (-30 + volumeDb) / 20))
        const peakVol = 0.9 * linearVol

        const beepGain = ctx.createGain()
        beepGain.gain.value = 0
        beepGain.connect(ctx.destination)

        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.connect(beepGain)

        const startAt = ctx.currentTime + 0.05
        for (const t of remainingBeeps) {
          const when = startAt + (t - elapsed)
          const progress = Math.min(t / total, 1)
          const hz = 300 + 400 * cubicEaseIn(progress)
          osc.frequency.setValueAtTime(hz, when)
          beepGain.gain.setValueAtTime(peakVol, when)
          beepGain.gain.linearRampToValueAtTime(0, when + 0.050)
        }

        osc.start(startAt)
        osc.stop(startAt + (total - elapsed) + 0.2)
        oscRef.current = { osc, gain: beepGain }
      }
    }
  }, [seconds, isPaused, holdDuration, stopBeeps])

  // End sound: fires exactly when the counter reaches holdDuration, no timer math
  useEffect(() => {
    if (seconds !== holdDuration) return
    const ctx = Tone.getContext().rawContext as unknown as AudioContext
    if (endSoundBuffer) {
      const source = ctx.createBufferSource()
      source.buffer = endSoundBuffer
      const gain = ctx.createGain()
      gain.gain.value = Math.min(1, Math.max(0, Math.pow(10, volumeDbRef.current / 20)))
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start()
    }
  }, [seconds, holdDuration])

  useEffect(() => {
    return () => { stopBeeps() }
  }, [stopBeeps])
}
