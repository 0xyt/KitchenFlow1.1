import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from '../Effects/Confetti'
import dishStyles from '../../data/dishStyles.json'
import { calculatePrice } from '../../utils/pricingEngine'

function Flash({ trigger }) {
  const [show, setShow] = useState(false)
  const prevRef = useRef(trigger)

  useEffect(() => {
    if (trigger !== prevRef.current) {
      prevRef.current = trigger
      setShow(true)
      const timer = setTimeout(() => setShow(false), 600)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 rounded-[12px] pointer-events-none z-20"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.25), transparent 70%)',
            boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.15)',
          }}
        />
      )}
    </AnimatePresence>
  )
}

function useTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const onMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ x: (px - 0.5) * 12, y: (0.5 - py) * 12 })
  }, [])
  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])
  return { tilt, onMouseMove, onMouseLeave }
}

export default function ResultCard({ recipe, user, onSave, onClear, flashKey, customStyles = [] }) {
  const allStyles = [...dishStyles, ...customStyles]
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [saved, setSaved] = useState(false)
  const { tilt, onMouseMove, onMouseLeave } = useTilt()

  const handleSave = useCallback(() => {
    onSave()
    setSaved(true)
    setConfettiTrigger(n => n + 1)
    setTimeout(() => setSaved(false), 2000)
  }, [onSave])

  if (!recipe) return null

  const matchLabel = {
    estrella: { icon: '⭐', label: 'Receta estrella' },
    semantica: { icon: '🧠', label: 'Razonamiento semántico' },
    categoria: { icon: '📋', label: 'Regla por categoría' },
    libre: { icon: '✨', label: 'Combinación libre' },
    restaurante: { icon: '🍽️', label: 'Receta del restaurante' },
  }

  const matchInfo = matchLabel[recipe.matchType] || { icon: '🍽️', label: 'Receta' }
  const isStar = recipe.matchType === 'estrella'

  return (
    <AnimatePresence>
      <Confetti trigger={confettiTrigger} />
      <motion.div
        key={recipe.name}
        initial={{ opacity: 0, y: 60, scale: 0.85, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: 40, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="bg-card rounded-[12px] card-shadow-xl border-2 p-5 w-80 relative overflow-hidden"
        style={{
          borderColor: isStar ? '#FBBF24' : 'hsl(var(--primary))',
          transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          boxShadow: isStar
            ? '0 0 30px rgba(251, 191, 36, 0.3), 0 10px 40px rgba(0,0,0,0.15)'
            : '0 0 30px rgba(139, 92, 246, 0.25), 0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
        {isStar && (
          <motion.div
            className="absolute inset-0 rounded-[12px] pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at 30% 20%, rgba(251,191,36,0.08), transparent 60%)',
                'radial-gradient(circle at 70% 80%, rgba(251,191,36,0.08), transparent 60%)',
                'radial-gradient(circle at 30% 20%, rgba(251,191,36,0.08), transparent 60%)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {recipe.matchType !== 'estrella' && (
          <motion.div
            className="absolute inset-0 rounded-[12px] pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.06), transparent 60%)',
                'radial-gradient(circle at 50% 100%, rgba(139,92,246,0.06), transparent 60%)',
                'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.06), transparent 60%)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        )}

        <Flash trigger={flashKey} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
              >
                {recipe.emoji}
              </motion.span>
              <div>
                <h3 className="font-title text-lg font-bold text-primary leading-tight">
                  {recipe.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {recipe.ingredients.map(i => i.nombre || i.name).join(' + ')}
                </p>
              </div>
            </div>
            <button
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {recipe.styleId && (() => {
            const style = allStyles.find(s => s.id === recipe.styleId)
            const pricing = style ? calculatePrice(recipe.ingredients || [], recipe.styleId, customStyles) : null
            return (
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {style && (
                  <span className="badge badge-primary">
                    {style.emoji} {style.nombre}
                  </span>
                )}
                {pricing && (
                  <span className="font-mono-price text-xs font-bold text-amber">
                    ${pricing.total.toFixed(2)}
                  </span>
                )}
              </div>
            )
          })()}

          {recipe.matchType === 'restaurante' && recipe.restaurantName && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="badge badge-primary">
                🍽️ {recipe.restaurantName}
              </span>
              {recipe.price && !recipe.styleId && (
                <span className="font-mono-price text-xs font-bold text-amber">
                  ${recipe.price.toFixed(2)}
                </span>
              )}
            </div>
          )}

          <p className="text-muted-foreground text-sm mb-3">
            {recipe.description}
          </p>

          {recipe.explanation && (
            <div className="bg-primary/5 rounded-[12px] p-3 mb-3 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">
                {matchInfo.icon} {matchInfo.label}
              </p>
              <p className="text-xs text-primary/80 leading-relaxed italic">
                {recipe.explanation}
              </p>
            </div>
          )}

          {recipe.modifiers?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Modificadores:</p>
              <div className="flex flex-wrap gap-1">
                {recipe.modifiers.map((m, i) => (
                  <span
                    key={i}
                    className="badge badge-primary"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-primary/5 rounded-[12px] p-3 mb-3">
            <p className="text-xs font-semibold text-primary mb-1">Preparación:</p>
            <p className="text-sm text-foreground leading-relaxed">
              {recipe.instructions}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {recipe.ingredients.map((ing, i) => (
              <span
                key={i}
                className="badge badge-primary text-xs"
              >
                {ing.emoji} {ing.nombre || ing.name}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {user && (
              <motion.button
                onClick={handleSave}
                disabled={saved}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-[8px] transition-all ${
                  saved
                    ? 'bg-emerald text-emerald-foreground'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {saved ? '¡Guardado!' : 'Favorito'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
