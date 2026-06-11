import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

const veggieEmojis = ['🍅', '🧅', '🥕', '🥬', '🧀', '🫘', '🍚', '🧄', '🍗', '🍋']

function createVeggieShape(emoji) {
  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 24
  const ctx = canvas.getContext('2d')
  ctx.font = '18px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 12, 13)
  return canvas
}

export default function Confetti({ trigger }) {
  const prevRef = useRef(0)

  useEffect(() => {
    if (trigger === 0) return
    prevRef.current = trigger

    const defaults = {
      spread: 80,
      ticks: 80,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 28,
    }

    const veggieCanvas = createVeggieShape(
      veggieEmojis[Math.floor(Math.random() * veggieEmojis.length)]
    )

    confetti({
      ...defaults,
      particleCount: 35,
      shapes: [veggieCanvas],
      scalar: 1.4,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#8B5CF6'],
    })

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 20,
        spread: 60,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#F59E0B', '#8B5CF6', '#10B981'],
        shapes: ['star'],
        scalar: 0.8,
      })
    }, 150)

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 40,
        spread: 120,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#8B5CF6', '#F59E0B', '#FFFFFF'],
        shapes: ['circle'],
        scalar: 0.6,
      })
    }, 300)
  }, [trigger])

  return null
}
