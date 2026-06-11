import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import dishStyles from '../../data/dishStyles.json'

const EMOJIS = ['🥪', '🥗', '🥙', '🌯', '🍕', '🌮', '🥣', '🍢', '🍞', '🎂', '🫓', '🥟', '🧆', '🥘', '🍲']

export default function AdminStyles({ customStyles = [], onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '', emoji: '🥪', base: '', tiempoBase: '10', precioBase: '2.00', descripcion: '',
  })

  const allStyles = useMemo(() => [...dishStyles, ...customStyles], [customStyles])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    onAdd({
      id: `custom_style_${Date.now()}`,
      nombre: form.nombre.trim(),
      emoji: form.emoji,
      base: form.base.trim(),
      tiempoBase: parseInt(form.tiempoBase) || 10,
      precioBase: parseFloat(form.precioBase) || 2.00,
      descripcion: form.descripcion.trim(),
    })
    setForm({ nombre: '', emoji: '🥪', base: '', tiempoBase: '10', precioBase: '2.00', descripcion: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title text-lg font-bold text-foreground">
          Estilos de plato <span className="text-sm font-normal text-muted-foreground">({allStyles.length})</span>
        </h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? 'Cancelar' : '+ Nuevo estilo'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre</label>
                  <Input value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Arepa" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Emoji</label>
                  <div className="flex flex-wrap gap-1">
                    {EMOJIS.slice(0, 10).map(e => (
                      <button key={e} type="button"
                        onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className={`text-lg p-1 rounded-[8px] transition-all ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Base</label>
                  <Input value={form.base}
                    onChange={e => setForm(f => ({ ...f, base: e.target.value }))}
                    placeholder="Ej: masa de maíz" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descripción</label>
                  <Input value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Breve descripción" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tiempo base (min)</label>
                  <Input type="number" value={form.tiempoBase}
                    onChange={e => setForm(f => ({ ...f, tiempoBase: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Precio base ($)</label>
                  <Input type="number" step="0.01" value={form.precioBase}
                    onChange={e => setForm(f => ({ ...f, precioBase: e.target.value }))} />
                </div>
              </div>
              <Button type="submit">Guardar estilo</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allStyles.map(style => {
          const isCustom = customStyles.some(s => s.id === style.id)
          return (
            <Card key={style.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-2xl">{style.emoji}</span>
                  {isCustom && (
                    <button onClick={() => onDelete(style.id)}
                      className="text-muted-foreground hover:text-danger transition-colors text-xs">✕</button>
                  )}
                </div>
                <p className="font-title text-sm font-bold text-foreground">{style.nombre}</p>
                <p className="text-[10px] text-muted-foreground mb-1">{style.base}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground/70">{style.tiempoBase} min</span>
                  <span className="font-mono-price text-primary font-semibold">${style.precioBase.toFixed(2)}</span>
                </div>
                {isCustom && (
                  <span className="text-[8px] text-primary/60 font-semibold mt-1 block">Personalizado</span>
                )}
                {!isCustom && (
                  <span className="text-[8px] text-muted-foreground/50 mt-1 block">Predefinido</span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
