import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import ingredients from '../../data/ingredients.json'
import DishStyleSelector from './DishStyleSelector'

const ALL_EMOJIS = ['🍕', '🍔', '🌮', '🥗', '🍲', '🍝', '🍛', '🥘', '🍳', '🥪', '🌯', '🥟', '🍜', '🥣', '🧆', '🥙']

export default function AdminRecipes({ recipes, ingredients: customIngredients, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '', emoji: '🍕', descripcion: '', instrucciones: '', precio: '',
    selectedIngs: [], styleId: '', modificadores: [], modifierInput: '',
  })

  const allIngredients = [
    ...ingredients.map(i => ({ ...i, source: 'global' })),
    ...customIngredients.map(i => ({ ...i, source: 'restaurant' })),
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || form.selectedIngs.length < 2) return
    onAdd({
      ingredientIds: form.selectedIngs,
      nombre: form.nombre.trim(),
      emoji: form.emoji,
      descripcion: form.descripcion.trim(),
      instrucciones: form.instrucciones.trim(),
      styleId: form.styleId || null,
      modificadores: form.modificadores,
      precio: form.precio ? parseFloat(form.precio) : null,
    })
    setForm({
      nombre: '', emoji: '🍕', descripcion: '', instrucciones: '', precio: '',
      selectedIngs: [], styleId: '', modificadores: [], modifierInput: '',
    })
    setShowForm(false)
  }

  const toggleIngredient = (id) => {
    setForm(f => ({
      ...f,
      selectedIngs: f.selectedIngs.includes(id)
        ? f.selectedIngs.filter(i => i !== id)
        : [...f.selectedIngs, id],
    }))
  }

  const addModifier = () => {
    if (!form.modifierInput.trim()) return
    setForm(f => ({
      ...f,
      modificadores: [...f.modificadores, f.modifierInput.trim()],
      modifierInput: '',
    }))
  }

  const removeModifier = (idx) => {
    setForm(f => ({ ...f, modificadores: f.modificadores.filter((_, i) => i !== idx) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title text-lg font-bold text-foreground">
          Recetas exclusivas <span className="text-sm font-normal text-muted-foreground">({recipes.length})</span>
        </h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? 'Cancelar' : '+ Nueva receta'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre del plato</label>
                  <Input value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Pizza Pepperoni" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Emoji</label>
                  <div className="flex flex-wrap gap-1">
                    {ALL_EMOJIS.slice(0, 10).map(e => (
                      <button key={e} type="button"
                        onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className={`text-lg p-1 rounded-[8px] transition-all ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ingredientes</label>
                <div className="flex flex-wrap gap-1.5">
                  {allIngredients.map(ing => (
                    <button key={ing.id} type="button"
                      onClick={() => toggleIngredient(ing.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors font-medium ${
                        form.selectedIngs.includes(ing.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {ing.emoji} {ing.nombre || ing.name}
                    </button>
                  ))}
                </div>
                {form.selectedIngs.length < 2 && (
                  <p className="text-xs text-danger mt-1">Selecciona al menos 2 ingredientes</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descripción</label>
                <Input value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Breve descripción del plato" />
              </div>

              <div className="col-span-2">
                <DishStyleSelector selected={form.styleId}
                  onSelect={id => setForm(f => ({ ...f, styleId: id }))} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Instrucciones</label>
                <textarea value={form.instrucciones}
                  onChange={e => setForm(f => ({ ...f, instrucciones: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-[8px] border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Describe el paso a paso..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Precio ($)</label>
                  <Input type="number" step="0.01" value={form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                    placeholder="Opcional" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Modificadores</label>
                <div className="flex gap-2 mb-2">
                  <Input value={form.modifierInput}
                    onChange={e => setForm(f => ({ ...f, modifierInput: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModifier() } }}
                    placeholder="Ej: ¿Con mayonesa?" />
                  <Button type="button" variant="secondary" size="sm" onClick={addModifier}>+ Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.modificadores.map((m, i) => (
                    <span key={i}
                      className="badge badge-primary gap-1">
                      {m}
                      <button type="button" onClick={() => removeModifier(i)} className="hover:text-danger">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={form.selectedIngs.length < 2}>Guardar receta</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recipes.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="font-title text-sm font-bold text-foreground">{r.nombre || r.name}</p>
                    {r.precio && <p className="font-mono-price text-xs text-amber font-medium">${r.precio.toFixed(2)}</p>}
                  </div>
                </div>
                <button onClick={() => onDelete(r.id)}
                  className="text-muted-foreground hover:text-danger transition-colors text-sm">✕</button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{r.descripcion}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(r.ingredientIds || []).map(id => {
                  const ing = allIngredients.find(i => i.id === id)
                  return ing ? (
                    <span key={id} className="badge badge-primary">
                      {ing.emoji} {ing.nombre || ing.name}
                    </span>
                  ) : null
                })}
              </div>
              {r.modificadores?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.modificadores.map((m, i) => (
                    <span key={i} className="badge badge-primary">{m}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {recipes.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No hay recetas exclusivas aún. ¡Crea tu primera!
          </p>
        )}
      </div>
    </div>
  )
}
