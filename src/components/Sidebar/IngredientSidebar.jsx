import { useState, useMemo } from 'react'
import { Input } from '../ui/input'
import ingredients from '../../data/ingredients.json'

const CATEGORIES = [
  { value: 'verdura', label: 'Verdura', emoji: '🥬' },
  { value: 'carne', label: 'Carne', emoji: '🥩' },
  { value: 'pescado', label: 'Pescado', emoji: '🐟' },
  { value: 'especia', label: 'Especia', emoji: '🧂' },
  { value: 'carbohidrato', label: 'Carbohidrato', emoji: '🌾' },
  { value: 'fruta', label: 'Fruta', emoji: '🍎' },
  { value: 'lácteo', label: 'Lácteo', emoji: '🧀' },
  { value: 'líquido', label: 'Líquido', emoji: '💧' },
  { value: 'otro', label: 'Otro', emoji: '📦' },
]

export default function IngredientSidebar({ user, customIngredients, restaurantName, disabledIngredientIds }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const hasCustom = customIngredients?.length > 0
  const disabled = disabledIngredientIds || []

  const q = search.toLowerCase().trim()

  const filteredGlobals = useMemo(() => {
    let list = ingredients
    if (category) list = list.filter(ing => ing.categoria === category)
    if (q) list = list.filter(ing => (ing.nombre || ing.name).toLowerCase().includes(q))
    list = list.filter(ing => !disabled.includes(ing.id))
    return list
  }, [q, category, disabled])

  const filteredCustom = useMemo(() => {
    let list = customIngredients
    if (category) list = list.filter(ing => ing.categoria === category)
    if (q) list = list.filter(ing => (ing.nombre || ing.name).toLowerCase().includes(q))
    return list
  }, [q, category, customIngredients])

  const showCustom = hasCustom && filteredCustom.length > 0

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <h2 className="font-title text-lg font-bold text-primary">Ingredientes</h2>
        <Input
          placeholder="Buscar ingrediente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 text-xs"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setCategory('')}
            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
              !category
              ? 'bg-primary text-white border-primary'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value === category ? '' : c.value)}
              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                category === c.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        {user && (
          <p className="text-[10px] text-muted-foreground">
            Arrástralos al canvas para combinarlos
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Globales {`(${filteredGlobals.length})`}
          </h3>
          <div className="flex flex-col gap-1.5">
            {filteredGlobals.map((ing) => (
              <div
                key={ing.id}
                draggable={!!user}
                onDragStart={(e) => {
                  if (!user) return
                  e.dataTransfer.setData('application/reactflow', JSON.stringify(ing))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-[8px] border transition-colors ${
                  user
                    ? 'bg-primary/5 hover:bg-primary/10 cursor-grab active:cursor-grabbing border-primary/20'
                    : 'bg-muted/30 cursor-not-allowed border-border opacity-50'
                }`}
              >
                <span className="text-lg">{ing.emoji}</span>
                <span className="text-sm font-medium text-foreground">{ing.nombre || ing.name}</span>
              </div>
            ))}
            {filteredGlobals.length === 0 && (
              <p className="text-xs text-muted-foreground/60 text-center py-4">Sin resultados</p>
            )}
          </div>
        </div>

        {showCustom && (
          <div>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              {restaurantName || 'Restaurante'}
            </h3>
            <div className="flex flex-col gap-1.5">
              {filteredCustom.map((ing) => (
                <div
                  key={ing.id}
                  draggable={!!user}
                  onDragStart={(e) => {
                    if (!user) return
                    e.dataTransfer.setData('application/reactflow', JSON.stringify({
                      id: ing.id,
                      nombre: ing.nombre || ing.name,
                      emoji: ing.emoji,
                      category: ing.category,
                    }))
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-grab active:cursor-grabbing transition-colors"
                >
                  <span className="text-lg">{ing.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{ing.nombre || ing.name}</span>
                  {ing.price && (
                    <span className="font-mono-price text-[10px] text-amber ml-auto">${ing.price.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
