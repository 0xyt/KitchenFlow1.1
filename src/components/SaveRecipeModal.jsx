import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X } from 'lucide-react'
import useSaveRecipe from '../hooks/useSaveRecipe'
import ingredientsData from '../data/ingredients.json'

const STYLE_EMOJIS = {
  sandwich: '🥪', wrap: '🌯', bowl: '🥣',
  salad: '🥗', pizza: '🍕', pasta: '🍝',
}

function getIngredient(id) {
  return ingredientsData.find(i => i.id === id)
}

export default function SaveRecipeModal({ isOpen, onClose, ingredientIds, dishStyle, price, score }) {
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { saveRecipe } = useSaveRecipe()
  const savedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setIsPublic(false)
      setSaved(false)
      setSaving(false)
      savedRef.current = false
    }
  }, [isOpen])

  const handleSave = useCallback(async () => {
    if (!name.trim() || saving || savedRef.current) return
    setSaving(true)
    savedRef.current = true
    try {
      const ids = ingredientIds || []
      await saveRecipe({
        name: name.trim().slice(0, 50),
        dishStyle: dishStyle || null,
        ingredientIds: ids.sort(),
        estimatedPrice: price || 0,
        compatibilityScore: score || 0,
        isPublic,
      })
      setSaved(true)
      setSaving(false)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#F59E0B', '#10B981', '#EC4899'],
      })
    } catch {
      setSaving(false)
      savedRef.current = false
    }
  }, [name, dishStyle, ingredientIds, price, score, isPublic, saveRecipe, saving])

  const ings = (ingredientIds || []).map(getIngredient).filter(Boolean)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-[#1A1A2E] border border-[#2D2D4E] rounded-[16px] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D2D4E]">
              <h3 className="font-title text-lg font-bold text-white">
                {saved ? '¡Guardado!' : 'Guardar Plato'}
              </h3>
              {!saved && (
                <button onClick={onClose} className="p-1 text-[#A0A0B8] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            {saved ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-10 px-5"
              >
                <span className="text-5xl">🎉</span>
                <p className="text-lg font-semibold text-white">¡Plato guardado!</p>
                <p className="text-sm text-[#A0A0B8] text-center">
                  {name} ha sido agregado a tus recetas.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-[#8B5CF6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#7C3AED] transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm text-[#A0A0B8] mb-1">Nombre del plato *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={50}
                    placeholder="Ej: Pollo al curry con arroz"
                    className="w-full px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6] placeholder-[#4A4A5E]"
                  />
                  <span className="text-[10px] text-[#4A4A5E] mt-1">{name.length}/50</span>
                </div>

                <div className="flex items-center justify-between px-3 py-2.5 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
                  <span className="text-sm text-[#A0A0B8]">Hacer público</span>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative w-10 h-5 rounded-full transition-all ${isPublic ? 'bg-[#8B5CF6]' : 'bg-[#2D2D4E]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {ings.length > 0 && (
                  <div>
                    <p className="text-sm text-[#A0A0B8] mb-2">Ingredientes ({ings.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ings.map(ing => (
                        <span
                          key={ing.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#0F0F1A] rounded-full border border-[#2D2D4E] text-xs text-white"
                        >
                          {ing.emoji} {ing.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {dishStyle && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
                      <span className="text-lg">{STYLE_EMOJIS[dishStyle] || '🍽️'}</span>
                      <span className="text-sm text-white capitalize">{dishStyle}</span>
                    </div>
                  )}
                  {price > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
                      <span className="text-lg">💰</span>
                      <span className="font-mono text-sm text-[#10B981] font-medium">${price.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {score > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#A0A0B8]">Compatibilidad</span>
                      <span className="text-xs text-white font-mono">{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#2D2D4E] rounded-full overflow-hidden">
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
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!name.trim() || saving}
                    className="flex-1 py-2.5 bg-[#8B5CF6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#7C3AED] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#2D2D4E] text-[#A0A0B8] rounded-[8px] text-sm hover:text-white transition-all disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
