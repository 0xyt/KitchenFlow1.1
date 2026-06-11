import dishStyles from '../../data/dishStyles.json'

export default function DishStyleSelector({ selected, onSelect, customStyles = [] }) {
  const allStyles = [
    ...dishStyles,
    ...customStyles.map(s => ({
      id: s.id,
      nombre: s.nombre,
      emoji: s.emoji,
      base: s.base,
      tiempoBase: s.tiempoBase,
      precioBase: s.precioBase,
      descripcion: s.descripcion || '',
      custom: true,
    })),
  ]

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-2 block">Estilo del plato</label>
      <div className="flex flex-wrap gap-2">
        {allStyles.map(style => (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id === selected ? '' : style.id)}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-[12px] border-2 transition-all ${
              selected === style.id
                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span className="text-xl">{style.emoji}</span>
            <span className="text-[10px] font-semibold leading-tight text-center">{style.nombre}</span>
          </button>
        ))}
      </div>
      {selected && (() => {
        const style = allStyles.find(s => s.id === selected)
        if (!style) return null
        return (
          <div className="mt-2 bg-primary/5 rounded-[8px] p-2 border border-primary/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tiempo base:</span>
              <span className="font-semibold text-primary">{style.tiempoBase} min</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-0.5">
              <span className="text-muted-foreground">Precio base estilo:</span>
              <span className="font-mono-price font-semibold text-amber">${style.precioBase.toFixed(2)}</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
