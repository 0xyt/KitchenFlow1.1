import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import ingredients from '../data/ingredients.json'
import { getIngredientPrice, getCompatibilityCount, getCompatibilityLevel } from '../utils/compatibilityEngine'
import IngredientHoverCard from './IngredientHoverCard'

const CATEGORY_FILTERS = [
  { value: 'verdura', label: 'Vegetal' },
  { value: 'proteina', label: 'Proteína' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'lacteo', label: 'Lácteo' },
]

function getDisplayCategory(ing) {
  if (ing.categoria === 'verdura') return 'verdura'
  if (ing.categoria === 'carne' || ing.categoria === 'pescado' || ing.categoria === 'otro') {
    if (ing.id === 'ing_096' || ing.nombre === 'Huevo') return 'proteina'
    return 'proteina'
  }
  if (ing.categoria === 'lácteo') return 'lacteo'
  if (ing.categoria === 'especia' || ing.categoria === 'líquido') return 'salsa'
  return null
}

export default function IngredientSidebar({ user, customIngredients, restaurantName, disabledIngredientIds }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [hoveredIng, setHoveredIng] = useState(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const hasCustom = customIngredients?.length > 0
  const disabled = disabledIngredientIds || []

  const q = search.toLowerCase().trim()

  const filteredGlobals = useMemo(() => {
    let list = ingredients
    if (category) {
      list = list.filter(ing => getDisplayCategory(ing) === category)
    }
    if (q) {
      list = list.filter(ing => (ing.nombre || ing.name).toLowerCase().includes(q))
    }
    list = list.filter(ing => !disabled.includes(ing.id))
    return list
  }, [q, category, disabled])

  const filteredCustom = useMemo(() => {
    let list = customIngredients || []
    if (category) {
      list = list.filter(ing => getDisplayCategory(ing) === category)
    }
    if (q) {
      list = list.filter(ing => (ing.nombre || ing.name).toLowerCase().includes(q))
    }
    return list
  }, [q, category, customIngredients])

  const showCustom = hasCustom && filteredCustom.length > 0

  const handleMouseEnter = (e, ing) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverPos({ x: rect.right + 12, y: rect.top })
    setHoveredIng(ing)
  }

  const handleMouseLeave = () => {
    setHoveredIng(null)
  }

  return (
    <aside className="w-[280px] bg-white border-r border-[#E5E0D5] flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-[#E5E0D5] space-y-3">
        <h2 className="title-sm text-primary">Ingredientes</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-search"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory('')}
            className={`chip ${!category ? 'chip-active' : 'chip-primary'}`}
          >
            Todas
          </button>
          {CATEGORY_FILTERS.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value === category ? '' : c.value)}
              className={`chip ${category === c.value ? 'chip-active' : 'chip-primary'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="label-sm text-muted">Globales</h3>
            <span className="text-[11px] text-muted">{filteredGlobals.length}</span>
          </div>
          <div className="flex flex-col gap-1">
            {filteredGlobals.map((ing) => {
              const price = getIngredientPrice(ing)
              const count = getCompatibilityCount(ing.id)
              const level = getCompatibilityLevel(count)
              return (
                <div
                  key={ing.id}
                  draggable={!!user}
                  onDragStart={(e) => {
                    if (!user) return
                    e.dataTransfer.setData('application/reactflow', JSON.stringify(ing))
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, ing)}
                  onMouseLeave={handleMouseLeave}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] border transition-all ${
                    user
                      ? 'bg-white hover:bg-[#F8F7F4] cursor-grab active:cursor-grabbing border-[#E5E0D5] hover:border-primary/30'
                      : 'bg-[#FAF9F7] cursor-not-allowed border-[#E5E0D5] opacity-50'
                  }`}
                >
                  <span className="text-lg leading-none">{ing.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="dish-name text-text truncate">{ing.nombre || ing.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={level.color} style={{ fontSize: 10, fontWeight: 500 }}>
                        {level.label}
                      </span>
                      <span className="text-muted" style={{ fontSize: 10 }}>{count} comb.</span>
                    </div>
                  </div>
                  <span className="font-medium text-[13px] text-accent">${price.toFixed(2)}</span>
                </div>
              )
            })}
            {filteredGlobals.length === 0 && (
              <p className="text-secondary text-center py-4">Sin resultados</p>
            )}
          </div>
        </div>

        {showCustom && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="label-sm text-primary">{restaurantName || 'Restaurante'}</h3>
              <span className="text-[11px] text-muted">{filteredCustom.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {filteredCustom.map((ing) => {
                const price = getIngredientPrice(ing)
                const count = getCompatibilityCount(ing.id)
                const level = getCompatibilityLevel(count)
                return (
                  <div
                    key={ing.id}
                    draggable={!!user}
                    onDragStart={(e) => {
                      if (!user) return
                      e.dataTransfer.setData('application/reactflow', JSON.stringify(ing))
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, ing)}
                    onMouseLeave={handleMouseLeave}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] border border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08] cursor-grab active:cursor-grabbing transition-all"
                  >
                    <span className="text-lg leading-none">{ing.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="dish-name text-text truncate">{ing.nombre || ing.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={level.color} style={{ fontSize: 10, fontWeight: 500 }}>
                          {level.label}
                        </span>
                        <span className="text-muted" style={{ fontSize: 10 }}>{count} comb.</span>
                      </div>
                    </div>
                    <span className="font-medium text-[13px] text-accent">${price.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {hoveredIng && (
        <div
          className="fixed z-50"
          style={{ left: hoverPos.x, top: hoverPos.y }}
          onMouseEnter={() => setHoveredIng(hoveredIng)}
          onMouseLeave={() => setHoveredIng(null)}
        >
          <IngredientHoverCard ingredient={hoveredIng} />
        </div>
      )}
    </aside>
  )
}
