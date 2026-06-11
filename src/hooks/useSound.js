import { useState, useCallback, useRef } from 'react'

export default function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('kitchenflow-muted') === 'true'
  })
  const ctxRef = useRef(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playClick = useCallback(() => {
    if (muted) return
    try {
      const ctx = getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 520
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    } catch (e) { /* silent */ }
  }, [muted, getContext])

  const playDing = useCallback(() => {
    if (muted) return
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523, now)
      osc1.frequency.setValueAtTime(659, now + 0.06)
      osc1.frequency.setValueAtTime(784, now + 0.12)
      gain1.gain.setValueAtTime(0.08, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.45)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1047, now + 0.15)
      gain2.gain.setValueAtTime(0.04, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.65)
    } catch (e) { /* silent */ }
  }, [muted, getContext])

  const playPop = useCallback(() => {
    if (muted) return
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(380, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.15)
    } catch (e) { /* silent */ }
  }, [muted, getContext])

  const playSparkle = useCallback(() => {
    if (muted) return
    try {
      const ctx = getContext()
      const now = ctx.currentTime
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800 + i * 200, now + i * 0.05)
        gain.gain.setValueAtTime(0.03, now + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.05)
        osc.stop(now + i * 0.05 + 0.12)
      }
    } catch (e) { /* silent */ }
  }, [muted, getContext])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      localStorage.setItem('kitchenflow-muted', next)
      return next
    })
  }, [])

  return { muted, toggleMute, playClick, playDing, playPop, playSparkle }
}
