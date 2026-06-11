import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AMBIENT_COUNT = 10

function AmbientParticle({ index }) {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const size = 2 + Math.random() * 4
  const duration = 10 + Math.random() * 20
  const delay = Math.random() * 10

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        boxShadow: `0 0 ${size * 2}px rgba(139, 92, 246, 0.1)`,
      }}
      animate={{
        y: [0, -20, 10, -10, 0],
        x: [0, 10, -15, 5, 0],
        opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
        scale: [1, 1.3, 0.8, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

function Spark({ id, x, y }) {
  const angle = Math.random() * Math.PI * 2
  const distance = 50 + Math.random() * 100
  const size = 2 + Math.random() * 5
  const hue = 260 + Math.random() * 30

  return (
    <motion.div
      key={id}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        backgroundColor: `hsl(${hue}, 80%, 65%)`,
        boxShadow: `0 0 ${size * 2}px hsl(${hue}, 80%, 65%), 0 0 ${size * 4}px hsl(${hue}, 80%, 50%)`,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration: 0.6 + Math.random() * 0.4, ease: 'easeOut' }}
    />
  )
}

function Ring({ x, y }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - 30,
        top: y - 30,
        width: 60,
        height: 60,
        border: '2px solid rgba(139, 92, 246, 0.4)',
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  )
}

export default function Particles({ trigger, containerRef }) {
  const [sparks, setSparks] = useState([])
  const [rings, setRings] = useState([])
  const [ambient] = useState(() =>
    Array.from({ length: AMBIENT_COUNT }, (_, i) => i)
  )

  const generate = useCallback(() => {
    const el = containerRef?.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const cx = rect.width - 340 + (Math.random() - 0.5) * 60
    const cy = rect.height - 300 + (Math.random() - 0.5) * 60

    const count = 20 + Math.floor(Math.random() * 16)
    const newSparks = Array.from({ length: count }, (_, i) => ({
      id: `spark-${Date.now()}-${i}`,
      x: cx,
      y: cy,
    }))
    setSparks(newSparks)
    setTimeout(() => setSparks([]), 1200)

    const newRing = { id: `ring-${Date.now()}`, x: cx, y: cy }
    setRings([newRing])
    setTimeout(() => setRings([]), 1000)
  }, [containerRef])

  useEffect(() => {
    if (trigger) generate()
  }, [trigger, generate])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {ambient.map((_, i) => (
        <AmbientParticle key={i} index={i} />
      ))}
      <AnimatePresence>
        {rings.map(r => (
          <Ring key={r.id} x={r.x} y={r.y} />
        ))}
        {sparks.map(s => (
          <Spark key={s.id} id={s.id} x={s.x} y={s.y} />
        ))}
      </AnimatePresence>
    </div>
  )
}
