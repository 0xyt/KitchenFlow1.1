import { motion } from 'framer-motion'

const INGREDIENT_BG = {
  verdura: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  carne: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  pescado: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  especia: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  líquido: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200',
  carbohidrato: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  fruta: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
  lácteo: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  otro: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
}

export default function MockupGenerator({ selectedStyle, ingredients, pricing, onPublish, plateName, setPlateName, modifiers, setModifiers, modifierInput, setModifierInput, addModifier }) {
  if (!selectedStyle || ingredients.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground/60">
        <span className="text-5xl block mb-4">📋</span>
        <p className="font-title text-base font-bold text-muted-foreground">Sin ingredientes ni estilo</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Selecciona ingredientes y un estilo para ver la vista previa</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[12px] border-2 border-primary/20 card-shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{selectedStyle.emoji}</span>
            <div>
              <p className="font-title text-lg font-extrabold text-foreground">{selectedStyle.nombre}</p>
              <p className="text-sm text-muted-foreground">{selectedStyle.descripcion}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-card rounded-[12px] p-4 border border-border card-shadow">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 font-semibold">Precio final</p>
              <p className="font-mono-price text-2xl font-bold text-amber">${pricing?.total.toFixed(2) || '—'}</p>
              {pricing && (
                <p className="text-[9px] text-muted-foreground/70 mt-1 leading-tight">{pricing.breakdown}</p>
              )}
            </div>
            <div className="bg-card rounded-[12px] p-4 border border-border card-shadow">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 font-semibold">Tiempo estimado</p>
              <p className="font-title text-2xl font-bold text-primary">{pricing?.totalTime || selectedStyle.tiempoBase} min</p>
              <p className="text-[9px] text-muted-foreground/70 mt-1">{ingredients.length} ingredientes + base</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ingredientes</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {ingredients.map((ing, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                className={`text-xs px-3 py-1.5 rounded-[20px] font-medium border border-current/20 ${INGREDIENT_BG[ing.categoria] || 'bg-muted text-muted-foreground'}`}
              >
                {ing.emoji} {ing.nombre || ing.name}
              </motion.span>
            ))}
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Nombre del plato</p>
          <input
            value={plateName}
            onChange={e => setPlateName(e.target.value)}
            placeholder="Ej: Pizza Pepperoni Don Pepe"
            className="w-full px-4 py-2.5 rounded-[8px] border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-5"
          />

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Modificadores (opcional)</p>
          <div className="flex gap-2 mb-2">
            <input
              value={modifierInput}
              onChange={e => setModifierInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModifier() } }}
              placeholder="Ej: ¿Sin cebolla?"
              className="flex-1 px-3 py-1.5 rounded-[8px] border border-border bg-card text-xs focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              onClick={addModifier}
              className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-[8px] hover:bg-primary/20 transition-colors"
            >
              + Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {modifiers.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 badge badge-primary">
                {m}
                <button onClick={() => setModifiers(modifiers.filter((_, j) => j !== i))} className="hover:text-danger text-xs">✕</button>
              </span>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onPublish({ name: plateName, styleId: selectedStyle.id, ingredientIds: ingredients.map(i => i.id), modifiers, price: pricing?.total })}
              className="flex-1 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-all card-shadow-lg shadow-primary/25 active:scale-[0.97]"
            >
              📢 Publicar en mi menú
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="glass-panel-strong rounded-[12px] p-4 flex items-center gap-4 card-shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin)}${encodeURIComponent('/#/menu?restaurant=')}${encodeURIComponent('demo')}`}
                alt="QR del menú"
                className="w-[70px] h-[70px] rounded-[8px]"
              />
              <div>
                <p className="text-xs font-bold text-foreground">Vista previa en móvil</p>
                <p className="text-[10px] text-muted-foreground/70">Escanea para ver cómo lo verá tu cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
