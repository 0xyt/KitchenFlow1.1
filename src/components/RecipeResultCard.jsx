import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTotalCompatibility, getIngredientPrice } from '../utils/compatibilityEngine'

const STYLES = [
  { id: 'ensalada', emoji: '🥗', label: 'Ensalada', price: 6.50 },
  { id: 'bowl', emoji: '🥣', label: 'Bowl', price: 8.50 },
  { id: 'sandwich', emoji: '🥪', label: 'Sándwich', price: 7.50 },
  { id: 'wrap', emoji: '🌯', label: 'Wrap', price: 7.00 },
  { id: 'pasta', emoji: '🍝', label: 'Pasta', price: 9.00 },
  { id: 'pizza', emoji: '🍕', label: 'Pizza', price: 10.00 },
]

export default function RecipeResultCard({ recipe, user, onSave, onClear, flashKey }) {
  const [saved, setSaved] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0])

  const totalCompat = recipe?.ingredients ? getTotalCompatibility(recipe.ingredients.map(i => i.id || i.ingredientId)) : 0

  const ingsPrice = useMemo(() => {
    if (!recipe?.ingredients) return 0
    return recipe.ingredients.reduce((sum, i) => {
      const price = getIngredientPrice(i)
      return sum + (typeof price === 'number' ? price : 0)
    }, 0)
  }, [recipe])

  const totalPrice = selectedStyle.price + ingsPrice

  const handleSave = useCallback(() => {
    onSave(selectedStyle)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [onSave, selectedStyle])

  if (!recipe) return null

  const isStar = recipe.matchType === 'estrella'

  return (
    <AnimatePresence>
      <motion.div
        key={recipe.name + (flashKey || 0)}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-[12px] shadow-[0_8px_32px_rgba(28,25,23,0.1)] border border-[#E5E0D5] p-5 w-[320px]"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recipe.emoji}</span>
            <div>
              <h3 className="font-semibold text-[16px] text-[#1C1917] leading-tight">
                {recipe.name}
              </h3>
              <p className="text-secondary mt-0.5">
                {recipe.ingredients.map(i => i.nombre || i.name).join(' + ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-muted hover:text-text transition-colors p-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="badge-detect">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            COMBINACIÓN DETECTADA
          </span>
          {isStar && (
            <span className="badge-detect" style={{ background: 'hsl(38 96% 50% / 0.1)', color: '#F59E0B' }}>
              ⭐ RECETA ESTRELLA
            </span>
          )}
        </div>

        <div className="card-surface p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span className="font-medium text-[13px] text-text">
              Compatibilidad con {totalCompat} ingredientes
            </span>
          </div>
          <p className="text-secondary">
            {recipe.explanation || recipe.description}
          </p>
        </div>

        {recipe.instructions && (
          <div className="mb-3">
            <p className="label-sm text-muted mb-1">Preparación:</p>
            <p className="text-secondary leading-relaxed">{recipe.instructions}</p>
          </div>
        )}

        {recipe.modifiers?.length > 0 && (
          <div className="mb-3">
            <p className="label-sm text-muted mb-1.5">Modificadores:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.modifiers.map((m, i) => (
                <span key={i} className="compatibility-tag text-[11px]">{m}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className="chip chip-primary text-[11px] px-2 py-0.5">
              {ing.emoji} {ing.nombre || ing.name}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#78716C] mb-2">
            Estilo del plato
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s)}
                className={`flex items-center gap-1.5 px-[10px] py-[6px] rounded-full text-[12px] transition-all ${
                  selectedStyle.id === s.id
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                    : 'bg-[#F3F0FF] border border-[#DDD8F5] text-[#6D28D9]'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[13px] text-text font-semibold">Total</span>
          <span className="text-[18px] font-bold text-[#8B5CF6]">${totalPrice.toFixed(2)}</span>
        </div>

        {user && (
          <motion.button
            onClick={handleSave}
            disabled={saved}
            whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-semibold text-[13px] transition-all ${
              saved
                ? 'bg-[#10B981] text-white'
                : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {saved ? 'Guardado' : 'Guardar receta'}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
