import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'

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

const EMOJIS = ['🧀', '🥩', '🐟', '🍗', '🥬', '🥕', '🧅', '🧄', '🍅', '🌶️', '🫑', '🍄', '🌿', '🫒', '🌾', '🫘', '🥜', '🍋', '🥑', '🍞', '🥚']

export default function AdminIngredients({ ingredients, onAdd, onDelete }) {
  const [form, setForm] = useState({ nombre: '', emoji: '🧀', categoria: 'verdura', precio: '' })
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    onAdd({
      nombre: form.nombre.trim(),
      emoji: form.emoji,
      categoria: form.categoria,
      precio: form.precio ? parseFloat(form.precio) : null,
    })
    setForm({ nombre: '', emoji: '🧀', categoria: 'verdura', precio: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title text-lg font-bold text-foreground">
          Ingredientes personalizados <span className="text-sm font-normal text-muted-foreground">({ingredients.length})</span>
        </h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? 'Cancelar' : '+ Nuevo ingrediente'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre</label>
                  <Input
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Pepperoni"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.slice(0, 10).map(e => (
                      <button key={e} type="button"
                        onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className={`text-lg p-1 rounded-[8px] transition-all ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full h-9 rounded-[8px] border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Precio ($)</label>
                  <Input
                    type="number" step="0.01" value={form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <Button type="submit">Guardar ingrediente</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ingredients.map(ing => (
          <Card key={ing.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{ing.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ing.nombre || ing.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIES.find(c => c.value === ing.categoria)?.label || ing.categoria}
                    {ing.precio ? <span className="font-mono-price text-amber ml-1">· ${ing.precio.toFixed(2)}</span> : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => onDelete(ing.id)}
                className="text-muted-foreground hover:text-danger transition-colors text-sm">✕</button>
            </CardContent>
          </Card>
        ))}
        {ingredients.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No hay ingredientes personalizados aún. ¡Crea tu primero!
          </p>
        )}
      </div>
    </div>
  )
}
