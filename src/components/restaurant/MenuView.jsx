import { useState } from 'react'
import { motion } from 'framer-motion'
import plateStyles from '../../data/plateStyles.json'
import dishStyles from '../../data/dishStyles.json'
import { calculateFinalPrice } from '../../utils/priceEngine'

const INGREDIENT_BG = {
  verdura: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  carne: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  pescado: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  especia: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  líquido: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
  carbohidrato: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  fruta: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-800',
  lácteo: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  otro: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
}

function PlateCard({ plate, onRequestModifier }) {
  const allStyles = [...plateStyles, ...dishStyles]
  const style = plate.styleId ? allStyles.find(s => s.id === plate.styleId) : null
  const pricing = plate.styleId && plate.ingredients
    ? calculateFinalPrice(plate.ingredients, plate.styleId)
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[12px] border border-border card-shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          {style && <span className="text-3xl">{style.emoji}</span>}
          <div className="flex-1 min-w-0">
            <p className="font-title text-base font-bold text-foreground truncate">{plate.name}</p>
            {style && (
              <p className="text-[10px] text-primary font-semibold">{style.nombre}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono-price text-lg font-bold text-amber">${(plate.price || pricing?.total || 0).toFixed(2)}</p>
            {pricing && (
              <p className="text-[9px] text-muted-foreground/70">{pricing.totalTime} min</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(plate.ingredients || []).map((ing, i) => (
            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${INGREDIENT_BG[ing.categoria] || 'bg-muted text-muted-foreground border-border'}`}>
              {ing.emoji} {ing.nombre || ing.name}
            </span>
          ))}
        </div>

        {plate.description && (
          <p className="text-xs text-muted-foreground mb-3">{plate.description}</p>
        )}

        {plate.modifiers?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Modificadores</p>
            <div className="flex flex-wrap gap-1">
              {plate.modifiers.map((m, i) => (
                <button
                  key={i}
                  onClick={() => onRequestModifier?.(plate.id, m)}
                  className="text-[10px] bg-primary/5 text-primary px-2 py-1 rounded-[20px] border border-primary/20 hover:bg-primary/10 transition-colors font-medium"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function MenuView({ restaurant, plates, isOwner, onPublish, onDeletePlate }) {
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [search, setSearch] = useState('')

  const categories = [...new Set(plates.flatMap(p =>
    (p.ingredients || []).map(i => i.categoria)
  ).filter(Boolean))]

  const filtered = plates.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'todas' || (p.ingredients || []).some(i => i.categoria === selectedCategory)
    return matchSearch && matchCat
  })

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-title text-xl font-extrabold text-primary flex items-center gap-2">
              {restaurant?.emoji || '🍽️'} {restaurant?.name || 'Menú del restaurante'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plates.length} platos en el menú
            </p>
          </div>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar plato..."
          className="w-full px-4 py-2 rounded-[8px] border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="px-6 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'todas'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🍽️</span>
            <p className="font-title text-base font-bold text-muted-foreground">
              {plates.length === 0 ? 'Sin platos publicados' : 'Sin resultados'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {plates.length === 0
                ? 'Este restaurante aún no ha publicado platos'
                : 'No hay platos que coincidan con tu búsqueda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(plate => (
              <PlateCard key={plate.id} plate={plate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
