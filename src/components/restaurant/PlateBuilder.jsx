import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import StyleSelector from './StyleSelector'
import MockupGenerator from './MockupGenerator'
import ingredients from '../../data/ingredients.json'
import dishStyles from '../../data/dishStyles.json'
import { calculateFinalPrice } from '../../utils/priceEngine'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const CATEGORIES = [
  { id: 'verdura', emoji: '🥬', label: 'Verduras' },
  { id: 'carne', emoji: '🥩', label: 'Carnes' },
  { id: 'pescado', emoji: '🐟', label: 'Pescados' },
  { id: 'especia', emoji: '🧂', label: 'Especias' },
  { id: 'líquido', emoji: '💧', label: 'Líquidos' },
  { id: 'carbohidrato', emoji: '🌾', label: 'Carbohidratos' },
  { id: 'fruta', emoji: '🍎', label: 'Frutas' },
  { id: 'lácteo', emoji: '🥛', label: 'Lácteos' },
  { id: 'otro', emoji: '📦', label: 'Otros' },
]

const STEP_LABELS = ['Ingredientes', 'Estilo', 'Precio', 'Vista previa', 'Publicar']

export default function PlateBuilder({ user, restaurant, customIngredients, customRecipes, customStyles, onPublished }) {
  const [step, setStep] = useState(0)
  const [selectedIngs, setSelectedIngs] = useState([])
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [manualPrice, setManualPrice] = useState('')
  const [plateName, setPlateName] = useState('')
  const [modifiers, setModifiers] = useState([])
  const [modifierInput, setModifierInput] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const allIngredients = useMemo(() => [
    ...ingredients.map(i => ({ ...i, source: 'global' })),
    ...(customIngredients || []).map(i => ({ ...i, source: 'restaurant' })),
  ], [customIngredients])

  const filteredIngredients = useMemo(() => {
    return allIngredients.filter(ing => {
      if (categoryFilter && ing.categoria !== categoryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = (ing.nombre || ing.name || '').toLowerCase()
        if (!name.includes(q)) return false
      }
      return true
    })
  }, [allIngredients, categoryFilter, search])

  const toggleIngredient = (id) => {
    setSelectedIngs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const addModifier = () => {
    if (!modifierInput.trim()) return
    setModifiers(prev => [...prev, modifierInput.trim()])
    setModifierInput('')
  }

  const allStyles = useMemo(() => [...dishStyles, ...(customStyles || [])], [customStyles])

  const pricing = useMemo(() => {
    if (!selectedStyle) return null
    const ingObjects = selectedIngs
      .map(id => allIngredients.find(i => i.id === id))
      .filter(Boolean)
    return calculateFinalPrice(ingObjects, selectedStyle, customStyles)
  }, [selectedStyle, selectedIngs, allIngredients, customStyles])

  const handlePublish = async (data) => {
    setPublishing(true)
    const ingObjects = selectedIngs
      .map(id => allIngredients.find(i => i.id === id))
      .filter(Boolean)

    const plate = {
      name: data.name || `${selectedStyle?.emoji || '🍽️'} ${selectedStyle?.nombre || 'Plato'} especial`,
      styleId: data.styleId,
      ingredientIds: data.ingredientIds,
      ingredients: ingObjects,
      modifiers: data.modifiers || modifiers,
      price: manualPrice ? parseFloat(manualPrice) : (pricing?.total || 0),
      description: `Plato elaborado con ${ingObjects.map(i => i.nombre || i.name).join(', ')}`,
      publishedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    }

    try {
      if (db && restaurant?.id) {
        await addDoc(collection(db, 'restaurants', restaurant.id, 'menu'), plate)
      }
      onPublished?.(plate)
      resetForm()
    } catch (e) {
      console.warn('Publish failed (no Firestore):', e.message)
      onPublished?.({ ...plate, id: `local_${Date.now()}` })
      resetForm()
    } finally {
      setPublishing(false)
    }
  }

  const resetForm = () => {
    setSelectedIngs([])
    setSelectedStyle(null)
    setManualPrice('')
    setPlateName('')
    setModifiers([])
    setStep(0)
  }

  const ingredientObjects = useMemo(() =>
    selectedIngs.map(id => allIngredients.find(i => i.id === id)).filter(Boolean),
    [selectedIngs, allIngredients]
  )

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-title text-xl font-extrabold text-primary">🧑‍🍳 Creador de platos</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {restaurant?.name ? `Restaurante: ${restaurant.name}` : 'Crea y publica platos para tu menú digital'}
            </p>
          </div>
          <a href="#/" className="text-sm text-primary hover:underline font-semibold">← Volver</a>
        </div>

        <div className="flex items-center gap-1.5 mt-4 flex-wrap">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                  i === step
                    ? 'bg-primary text-primary-foreground card-shadow'
                    : i < step
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground/60'
                }`}
              >
                {i + 1}. {label}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span className={`text-[8px] ${i < step ? 'text-primary' : 'text-muted-foreground/30'}`}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-title text-base font-bold text-foreground">
                Selecciona ingredientes <span className="text-sm font-normal text-muted-foreground">({selectedIngs.length} seleccionados)</span>
              </p>
              <Button
                size="sm"
                disabled={selectedIngs.length < 2}
                onClick={() => setStep(1)}
              >
                Siguiente →
              </Button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoryFilter('')}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  !categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id === categoryFilter ? '' : cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full px-4 py-2.5 rounded-[8px] border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-4"
            />

            <div className="flex flex-wrap gap-2">
              {filteredIngredients.map((ing, i) => (
                <motion.button
                  key={ing.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`text-sm px-3 py-2 rounded-[8px] border-2 transition-all ${
                    selectedIngs.includes(ing.id)
                      ? 'bg-primary text-primary-foreground border-primary card-shadow'
                      : 'bg-card text-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {ing.emoji} {ing.nombre || ing.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {step >= 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {step === 1 && (
              <div>
                <StyleSelector
                  selected={selectedStyle}
                  onSelect={(id) => { setSelectedStyle(id); setStep(2) }}
                  customStyles={customStyles}
                />
              </div>
            )}

            {step >= 2 && selectedStyle && (
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{allStyles.find(s => s.id === selectedStyle)?.emoji}</span>
                    <div>
                      <p className="font-title text-lg font-bold text-foreground">
                        {allStyles.find(s => s.id === selectedStyle)?.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">{ingredientObjects.length} ingredientes</p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-[12px] p-4 mb-4 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">Desglose de precio</p>
                    {pricing ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base del estilo</span>
                          <span className="font-mono-price font-medium">${pricing.basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ingredientes (×{1.5})</span>
                          <span className="font-mono-price font-medium">${pricing.ingredientCostWithMarkup.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Extra por dificultad</span>
                          <span className="font-mono-price font-medium text-amber">+${pricing.difficultyExtra.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Extra por tiempo</span>
                          <span className="font-mono-price font-medium text-amber">+${pricing.timeExtra.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between font-bold text-primary">
                          <span className="font-title">Total</span>
                          <span className="font-mono-price">${pricing.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground/70">Tiempo estimado</span>
                          <span className="font-semibold text-primary">{pricing.totalTime} min</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/70">Selecciona un estilo para ver el precio</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Precio manual (opcional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualPrice}
                      onChange={e => setManualPrice(e.target.value)}
                      placeholder={pricing ? `Auto: $${pricing.total.toFixed(2)}` : 'Deja vacío para auto-cálculo'}
                      className="w-full px-4 py-2 rounded-[8px] border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)}>← Atrás</Button>
                    <Button onClick={() => setStep(3)}>Ver vista previa →</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step >= 3 && selectedStyle && (
              <div>
                <MockupGenerator
                  selectedStyle={allStyles.find(s => s.id === selectedStyle)}
                  ingredients={ingredientObjects}
                  pricing={pricing}
                  onPublish={handlePublish}
                  plateName={plateName}
                  setPlateName={setPlateName}
                  modifiers={modifiers}
                  setModifiers={setModifiers}
                  modifierInput={modifierInput}
                  setModifierInput={setModifierInput}
                  addModifier={addModifier}
                />
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" onClick={() => setStep(2)}>← Atrás</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
