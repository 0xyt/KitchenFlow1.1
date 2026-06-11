import plateStyles from '../../data/plateStyles.json'
import dishStyles from '../../data/dishStyles.json'
import { motion } from 'framer-motion'

export default function StyleSelector({ selected, onSelect, customStyles = [] }) {
  const allStyles = [
    ...plateStyles.map(s => ({ ...s, _source: 'base' })),
    ...customStyles.map(s => ({ ...s, _source: 'custom' })),
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎨</span>
        <p className="font-title text-base font-bold text-foreground">
          Elige el estilo de tu plato
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {allStyles.map((style, i) => (
          <motion.button
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(style.id === selected ? null : style.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-[12px] border-2 transition-all ${
              selected === style.id
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
                : 'bg-card text-foreground border-border hover:border-primary/40 hover:card-shadow-lg'
            }`}
          >
            <span className="text-2xl">{style.emoji}</span>
            <span className="text-[10px] font-semibold leading-tight text-center">{style.nombre}</span>
            {style._source === 'custom' && (
              <span className="text-[7px] bg-white/20 text-white px-1 rounded-full mt-0.5">personalizado</span>
            )}
          </motion.button>
        ))}
      </div>
      {selected && (() => {
        const style = allStyles.find(s => s.id === selected)
        if (!style) return null
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-primary/5 rounded-[12px] p-4 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{style.emoji}</span>
              <div>
                <p className="font-title text-sm font-bold text-foreground">{style.nombre}</p>
                <p className="text-xs text-muted-foreground">Base: {style.base}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between bg-card rounded-[8px] px-3 py-2 border border-border">
                <span className="text-muted-foreground">Precio base</span>
                <span className="font-mono-price font-bold text-amber">${style.precioBase.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between bg-card rounded-[8px] px-3 py-2 border border-border">
                <span className="text-muted-foreground">Tiempo base</span>
                <span className="font-bold text-primary">{style.tiempoBase} min</span>
              </div>
            </div>
            {style.sugerencia && (
              <p className="text-xs text-muted-foreground/80 mt-3 italic">💡 {style.sugerencia}</p>
            )}
          </motion.div>
        )
      })()}
    </div>
  )
}
