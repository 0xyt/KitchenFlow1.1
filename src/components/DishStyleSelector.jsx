import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { detectPossibleStyles } from '../engine/styleDetector'

function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch { /* audio not available */ }
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function ScoreBar({ score }) {
  return (
    <div className="w-full h-1.5 bg-[#2D2D4E] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${score}%`,
          background: score > 75
            ? 'linear-gradient(90deg, #10B981, #34D399)'
            : score > 50
              ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
              : 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
        }}
      />
    </div>
  )
}

export default function DishStyleSelector({ ingredientIds, selectedStyle, onStyleChange, restaurantStyles }) {
  const possible = useMemo(() => detectPossibleStyles(ingredientIds), [ingredientIds])

  const filtered = useMemo(() => {
    let list = possible.filter(s => s.score > 30)
    if (restaurantStyles && Object.keys(restaurantStyles).length > 0) {
      list = list.filter(s => restaurantStyles[s.style] === true)
    }
    return list.length > 0 ? list : possible.slice(0, 1)
  }, [possible, restaurantStyles])

  const bestScore = filtered.length > 0 ? filtered[0].score : 0

  return (
    <div>
      <p className="text-sm text-[#A0A0B8] mb-3">Selecciona el estilo del plato:</p>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {filtered.map(s => (
          <StyleCard
            key={s.style}
            data={s}
            isSelected={selectedStyle === s.style}
            isBest={s.score === bestScore}
            onClick={() => {
              playClickSound()
              if (onStyleChange) onStyleChange(s.style)
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function StyleCard({ data, isSelected, isBest, onClick }) {
  return (
    <motion.button
      variants={item}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-4 rounded-[12px] transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#8B5CF6]/15 border-2 border-[#8B5CF6]'
          : 'bg-[#1A1A2E] border border-[#2D2D4E] hover:border-[#8B5CF6]/50'
      }`}
    >
      {isBest && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#F59E0B] text-[10px] font-bold text-[#0F0F1A] rounded-full shadow-lg shadow-[#F59E0B]/30">
          Recomendado
        </span>
      )}
      <span className="text-3xl">{data.emoji}</span>
      <span className="text-sm font-semibold text-white">{data.label}</span>
      <span className="font-mono text-xs text-[#F59E0B] font-medium">${data.basePrice.toFixed(2)}</span>
      <ScoreBar score={data.score} />
      <span className="text-[9px] text-[#4A4A5E] text-center leading-tight mt-0.5">{data.reason}</span>
    </motion.button>
  )
}

export function useDishStyle(ingredientIds) {
  const [selectedStyle, setSelectedStyle] = useState(null)

  const possibleStyles = useMemo(() => detectPossibleStyles(ingredientIds), [ingredientIds])

  const filteredStyles = useMemo(() => {
    return possibleStyles.filter(s => s.score > 30)
  }, [possibleStyles])

  useEffect(() => {
    if (!selectedStyle && filteredStyles.length > 0) {
      setSelectedStyle(filteredStyles[0].style)
    }
  }, [filteredStyles, selectedStyle])

  const currentStyleData = useMemo(() => {
    return possibleStyles.find(s => s.style === selectedStyle) || null
  }, [possibleStyles, selectedStyle])

  return { possibleStyles: filteredStyles, selectedStyle, setSelectedStyle, currentStyleData }
}
