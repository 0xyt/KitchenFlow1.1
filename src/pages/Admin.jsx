import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Package, ClipboardList, Users,
  Plus, X, Search, Trash2, Edit3, Save, Eye, EyeOff, LogOut, ChevronLeft
} from 'lucide-react'
import {
  doc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, getDoc, query, where, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import ingredientsData from '../data/ingredients.json'
import {
  getCompatibilityCount,
  getCompatibilityLevel,
  getIngredientPrice,
  getCompatibleIngredientNames
} from '../utils/compatibilityEngine'

const TABS = [
  { id: 'restaurant', label: 'Restaurante', icon: Store },
  { id: 'ingredients', label: 'Ingredientes', icon: Package },
  { id: 'menu', label: 'Menú', icon: ClipboardList },
  { id: 'team', label: 'Equipo', icon: Users },
]

const CATEGORIES = ['verdura', 'carne', 'pescado', 'lácteo', 'especia', 'líquido', 'carbohidrato', 'fruta', 'otro']

function TabButton({ tab, active, onClick }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-[8px] ${
        active
          ? 'bg-[#F3F0FF] text-[#6D28D9] border-l-[3px] border-[#8B5CF6]'
          : 'text-[#78716C] hover:bg-[#F8F7FF]'
      }`}
      style={active ? { borderLeft: '3px solid #8B5CF6' } : {}}
    >
      <Icon size={18} />
      <span>{tab.label}</span>
    </button>
  )
}

function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white border border-[#E5E0D5] rounded-[12px] p-5 ${className}`}>
      {title && <h3 className="font-semibold text-[15px] text-text mb-4">{title}</h3>}
      {children}
    </div>
  )
}

function ChipInput({ chips, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const addChip = () => {
    const v = input.trim()
    if (v && !chips.includes(v)) {
      onChange([...chips, v])
      setInput('')
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded-[8px] border border-[#E5E0D5]">
      {chips.map((c, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary/[0.1] text-primary text-xs rounded-full">
          {c}
          <button onClick={() => onChange(chips.filter((_, j) => j !== i))} className="hover:text-text">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip() } }}
        onBlur={addChip}
        placeholder={placeholder || 'Agregar...'}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-text outline-none placeholder:text-muted"
      />
    </div>
  )
}

export default function Admin() {
  const { user, restaurantId } = useAuth()
  const [activeTab, setActiveTab] = useState('restaurant')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex">
        <aside className="w-[220px] min-h-screen border-r border-[#E5E0D5] bg-white shrink-0 flex flex-col">
          <div className="flex items-center gap-3 px-4 h-14 border-b border-[#E5E0D5]">
            <div className="w-8 h-8 flex items-center justify-center bg-[#8B5CF6] rounded-[8px] text-white text-[16px]">
              🍽️
            </div>
            <div>
              <span className="text-[16px] font-bold text-[#1C1917]">KitchenFlow</span>
              <p className="text-[11px] text-[#78716C] leading-tight">Panel Admin</p>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-1 mt-2">
            {TABS.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>
          <div className="p-2 border-t border-[#E5E0D5]">
            <a
              href="#/"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:bg-surface-hover hover:text-text rounded-[8px] transition-all"
            >
              <ChevronLeft size={18} />
              <span>Volver</span>
            </a>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between px-6 h-14 border-b border-[#E5E0D5] bg-white shrink-0">
            <div className="flex items-center gap-3">
              {(() => {
                const TabIcon = TABS.find(t => t.id === activeTab)?.icon
                return TabIcon ? <TabIcon size={20} className="text-primary" /> : null
              })()}
              <h2 className="font-semibold text-[16px] text-text">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
            {restaurantId && (
              <span className="text-[11px] text-muted font-mono">
                ID: {restaurantId.slice(0, 8)}...
              </span>
            )}
          </header>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'restaurant' && <RestaurantTab user={user} restaurantId={restaurantId} showToast={showToast} />}
                {activeTab === 'ingredients' && <IngredientsTab restaurantId={restaurantId} showToast={showToast} />}
                {activeTab === 'menu' && <MenuTab restaurantId={restaurantId} showToast={showToast} />}
                {activeTab === 'team' && <TeamTab restaurantId={restaurantId} showToast={showToast} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-primary text-white rounded-[8px] shadow-lg text-sm font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============ TAB: RESTAURANTE ============ */
function RestaurantTab({ user, restaurantId, showToast }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    if (!db || !restaurantId) return
    getDoc(doc(db, 'restaurants', restaurantId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setName(d.name || '')
        setDescription(d.description || '')
        setPhone(d.phone || '')
        setAddress(d.address || '')
      }
    })
  }, [restaurantId])

  const handleSave = async () => {
    if (!db || !restaurantId) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'restaurants', restaurantId), {
        name, description, phone, address,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      showToast('Restaurante actualizado')
    } catch (err) {
      showToast('Error: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-xl space-y-6">
      <SectionCard title="Información del Restaurante">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Teléfono</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Dirección</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </SectionCard>

      <button onClick={handleSave} disabled={saving}
        className="btn-primary">
        <Save size={15} /> {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

/* ============ TAB: INGREDIENTES ============ */
function IngredientsTab({ restaurantId, showToast }) {
  const [search, setSearch] = useState('')
  const [customIngs, setCustomIngs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', emoji: '', category: 'otro', price: 0, tags: [] })
  const [editingId, setEditingId] = useState(null)
  const [disabledIngredientIds, setDisabledIngredientIds] = useState([])
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || !db || !restaurantId) return
    loadedRef.current = true
    const q = query(collection(db, 'ingredients'), where('restaurantId', '==', restaurantId))
    onSnapshot(q, snap => {
      setCustomIngs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) {
        setDisabledIngredientIds(snap.data().disabledIngredientIds || [])
      }
    })
  }, [restaurantId])

  const toggleIngredient = async (ingId) => {
    if (!db || !restaurantId) return
    const next = disabledIngredientIds.includes(ingId)
      ? disabledIngredientIds.filter(id => id !== ingId)
      : [...disabledIngredientIds, ingId]
    await setDoc(doc(db, 'restaurants', restaurantId), { disabledIngredientIds: next }, { merge: true })
    setDisabledIngredientIds(next)
  }

  const handleSubmit = async () => {
    if (!db || !restaurantId || !form.name.trim()) return
    const data = { ...form, name: form.name.trim(), restaurantId, createdAt: serverTimestamp() }
    try {
      if (editingId) {
        await setDoc(doc(db, 'ingredients', editingId), data, { merge: true })
        showToast('Ingrediente actualizado')
      } else {
        await addDoc(collection(db, 'ingredients'), data)
        showToast('Ingrediente agregado')
      }
      setForm({ name: '', emoji: '', category: 'otro', price: 0, tags: [] })
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      showToast('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, 'ingredients', id))
      showToast('Ingrediente eliminado')
    } catch (err) {
      showToast('Error: ' + err.message)
    }
  }

  const startEdit = (ing) => {
    setForm({ name: ing.name, emoji: ing.emoji || '', category: ing.category || 'otro', price: ing.price || 0, tags: ing.tags || [] })
    setEditingId(ing.id)
    setShowForm(true)
  }

  const q = search.toLowerCase().trim()
  const filteredGlobals = ingredientsData.filter(i =>
    (i.nombre || i.name).toLowerCase().includes(q)
  )

  return (
    <div className="space-y-6">
      <SectionCard title="Ingredientes Globales">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ingredientes..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D5]">
                <th className="text-left py-2 pr-4 font-medium text-muted text-[11px] uppercase tracking-wider">Ingrediente</th>
                <th className="text-left py-2 pr-4 font-medium text-muted text-[11px] uppercase tracking-wider">Categoría</th>
                <th className="text-left py-2 pr-4 font-medium text-muted text-[11px] uppercase tracking-wider">Compatibilidad</th>
                <th className="text-left py-2 pr-4 font-medium text-muted text-[11px] uppercase tracking-wider">Combina con</th>
                <th className="text-right py-2 font-medium text-muted text-[11px] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredGlobals.map(ing => {
                const count = getCompatibilityCount(ing.id)
                const level = getCompatibilityLevel(count)
                const compatibleNames = getCompatibleIngredientNames(ing.id)
                const isDisabled = disabledIngredientIds.includes(ing.id)
                return (
                  <tr key={ing.id} className={`border-b border-[#E5E0D5] ${isDisabled ? 'opacity-50' : ''}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ing.emoji}</span>
                        <span className={`font-medium text-[13px] ${isDisabled ? 'line-through text-muted' : 'text-text'}`}>
                          {ing.nombre || ing.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[12px] text-muted">{ing.categoria}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        level.label === 'Alta' || level.label === 'Muy alta'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : level.label === 'Media'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}>{level.label}</span>
                      <span className="text-muted text-[11px] ml-1">({count})</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {compatibleNames.slice(0, 3).map((name, i) => (
                          <span key={i} className="compatibility-tag text-[10px]">{name}</span>
                        ))}
                        {compatibleNames.length > 3 && (
                          <span className="text-[10px] text-muted">+{compatibleNames.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => toggleIngredient(ing.id)}
                        className={`p-1.5 rounded transition-all ${isDisabled ? 'text-muted hover:text-danger' : 'text-emerald-600 hover:text-text'}`}
                        title={isDisabled ? 'Habilitar' : 'Deshabilitar'}>
                        {isDisabled ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title={`Mis Ingredientes (${customIngs.length})`}>
        <div className="space-y-2 mb-4">
          {customIngs.map(ing => {
            const count = getCompatibilityCount(ing.id)
            const level = getCompatibilityLevel(count)
            return (
              <div key={ing.id} className="flex items-center gap-3 px-4 py-3 bg-surface rounded-[8px] border border-[#E5E0D5]">
                <span className="text-lg">{ing.emoji || '🧂'}</span>
                <span className="text-[13px] font-medium text-text flex-1">{ing.name}</span>
                <span className="text-[11px] text-muted uppercase">{ing.category}</span>
                <span className={`text-[12px] font-medium ${level.color}`}>{level.label}</span>
                <span className="text-[13px] font-medium text-accent">${(ing.price || 0).toFixed(2)}</span>
                <button onClick={() => startEdit(ing)} className="p-1 text-muted hover:text-primary"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(ing.id)} className="p-1 text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            )
          })}
          {customIngs.length === 0 && !showForm && (
            <p className="text-secondary text-center py-4">Sin ingredientes personalizados aún.</p>
          )}
        </div>

        {showForm && (
          <div className="space-y-3 p-4 bg-surface rounded-[8px] border border-primary/30 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre"
                className="px-3 py-2 bg-white border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
              <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="Emoji"
                className="px-3 py-2 bg-white border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 bg-white border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} placeholder="Precio"
                className="px-3 py-2 bg-white border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Tags</label>
              <ChipInput chips={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} placeholder="Escribe y presiona Enter" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? 'Actualizar' : 'Agregar'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', emoji: '', category: 'otro', price: 0, tags: [] }) }}
                className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/[0.08] text-primary rounded-[8px] text-sm font-medium hover:bg-primary/[0.12] transition-all">
            <Plus size={16} /> Nuevo ingrediente
          </button>
        )}
      </SectionCard>
    </div>
  )
}

/* ============ TAB: MENÚ ============ */
function MenuTab({ restaurantId, showToast }) {
  const [plates, setPlates] = useState([])
  const [menuPublic, setMenuPublic] = useState(false)
  const [editing, setEditing] = useState(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!db || !restaurantId) return
    const q = query(
      collection(db, 'recipes'),
      where('restaurantId', '==', restaurantId)
    )
    const unsubRecipes = onSnapshot(q, snap => {
      setPlates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubRestaurant = onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) setMenuPublic(snap.data().menuPublic || false)
    })
    return () => {
      unsubRecipes()
      unsubRestaurant()
    }
  }, [restaurantId])

  const togglePublish = async (plate) => {
    if (!db || !restaurantId) return
    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'recipes', plate.id), {
        isPublic: !plate.isPublic,
      }, { merge: true })
      showToast(plate.isPublic ? 'Ocultado del menú público' : 'Publicado en el menú')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const toggleMenuPublic = async () => {
    if (!db || !restaurantId) return
    try {
      await setDoc(doc(db, 'restaurants', restaurantId), { menuPublic: !menuPublic }, { merge: true })
      setMenuPublic(!menuPublic)
      showToast(menuPublic ? 'Menú oculto' : 'Menú visible para clientes')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const handleDelete = async (id) => {
    if (!db || !restaurantId) return
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'recipes', id))
      showToast('Plato eliminado')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const handleEditName = async (id) => {
    if (!db || !restaurantId || !editing) return
    try {
      await setDoc(doc(db, 'restaurants', restaurantId, 'recipes', id), {
        name: editing.name, price: editing.price,
      }, { merge: true })
      setEditing(null)
      showToast('Actualizado')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const allIngredients = ingredientsData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-[#E5E0D5] rounded-[12px] p-4">
        <div>
          <h3 className="font-medium text-[14px] text-text">Menú Público</h3>
          <p className="text-secondary mt-0.5">Los clientes podrán ver los platos publicados</p>
        </div>
        <button onClick={toggleMenuPublic}
          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${
            menuPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-surface text-muted'
          }`}>
          {menuPublic ? <Eye size={15} /> : <EyeOff size={15} />}
          {menuPublic ? 'Visible' : 'Oculto'}
        </button>
      </div>

      <div className="space-y-3">
        {plates.map(plate => (
          <div key={plate.id} className="bg-white border border-[#E5E0D5] rounded-[12px] p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{plate.emoji || '🍽️'}</span>
              {editing?.id === plate.id ? (
                <div className="flex-1 flex gap-2">
                  <input value={editing.name} onChange={e => setEditing(e => ({ ...e, name: e.target.value }))}
                    className="flex-1 px-2 py-1 bg-surface border border-[#E5E0D5] rounded-[6px] text-text text-sm outline-none" />
                  <input type="number" step="0.01" value={editing.price} onChange={e => setEditing(e => ({ ...e, price: parseFloat(e.target.value) || 0 }))}
                    className="w-20 px-2 py-1 bg-surface border border-[#E5E0D5] rounded-[6px] text-text text-sm outline-none" />
                  <button onClick={() => handleEditName(plate.id)} className="p-1.5 text-emerald-600"><Save size={14} /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 text-muted"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-[13px] font-medium text-text">{plate.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(plate.ingredientIds || []).slice(0, 4).map(id => {
                        const ing = allIngredients.find(i => i.id === id)
                        return ing ? (
                          <span key={id} className="compatibility-tag">{ing.emoji} {ing.nombre}</span>
                        ) : null
                      })}
                      {(plate.ingredientIds || []).length > 4 && (
                        <span className="text-[10px] text-muted">+{(plate.ingredientIds || []).length - 4}</span>
                      )}
                    </div>
                  </div>
                  {plate.style && (
                    <span className="text-[11px] text-muted bg-surface px-2 py-1 rounded-full">{plate.style}</span>
                  )}
                  <span className="font-medium text-[13px] text-accent">${(plate.price || 0).toFixed(2)}</span>
                  <button onClick={() => setEditing({ id: plate.id, name: plate.name, price: plate.price })} className="p-1 text-muted hover:text-primary"><Edit3 size={14} /></button>
                  <button onClick={() => togglePublish(plate)} className={`p-1 ${plate.isPublic ? 'text-emerald-600' : 'text-muted'} hover:text-text`}>
                    {plate.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(plate.id)} className="p-1 text-muted hover:text-danger"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {plates.length === 0 && (
          <div className="text-center py-[60px] px-5">
            <div className="text-[48px] mb-4">🍽️</div>
            <p className="text-[15px] font-semibold text-[#1C1917]">Tu menú está vacío</p>
            <p className="text-[13px] text-[#78716C] mt-[6px]">
              Ve al canvas, conecta ingredientes y guarda tu primera receta
            </p>
            <a href="#/"
              className="inline-block mt-5 px-5 py-[10px] bg-[#8B5CF6] text-white rounded-[8px] text-[13px] font-semibold no-underline"
            >
              Ir al canvas →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============ TAB: EQUIPO ============ */
function TeamTab({ restaurantId, showToast }) {
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!db || !restaurantId) return
    const unsub = onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) {
        setMembers(snap.data().members || [])
      }
    })
    return unsub
  }, [restaurantId])

  const sendInvite = async () => {
    if (!db || !restaurantId || !inviteEmail.trim()) return
    try {
      await setDoc(doc(db, 'invitations', inviteEmail.trim()), {
        email: inviteEmail.trim(),
        restaurantId,
        role: inviteRole,
        createdAt: serverTimestamp(),
      })
      showToast(`Invitación enviada a ${inviteEmail.trim()}`)
      setInviteEmail('')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const revokeMember = async (uid) => {
    if (!db || !restaurantId) return
    try {
      const next = members.filter(m => m.uid !== uid)
      await setDoc(doc(db, 'restaurants', restaurantId), { members: next }, { merge: true })
      showToast('Acceso revocado')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  return (
    <div className="max-w-xl space-y-6">
      <SectionCard title={`Miembros (${members.length})`}>
        {members.map(m => (
          <div key={m.uid} className="flex items-center gap-3 px-4 py-3 bg-surface rounded-[8px] border border-[#E5E0D5] mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/[0.15] flex items-center justify-center text-primary text-sm font-bold">
              {(m.name || m.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-text font-medium">{m.name || m.email}</p>
              <p className="text-[11px] text-muted">{m.role}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              m.role === 'chef' ? 'bg-primary/[0.1] text-primary' : 'bg-surface text-muted border border-[#E5E0D5]'
            }`}>
              {m.role}
            </span>
            <button onClick={() => revokeMember(m.uid)} className="p-1 text-muted hover:text-danger"><LogOut size={14} /></button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-secondary text-center py-4">Sin miembros aún.</p>
        )}
      </SectionCard>

      <SectionCard title="Invitar Miembro">
        <div className="flex gap-2">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com"
            className="flex-1 px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            className="px-3 py-2 bg-surface border border-[#E5E0D5] rounded-[8px] text-text text-sm outline-none focus:border-primary">
            <option value="staff">Staff</option>
            <option value="chef">Chef</option>
          </select>
          <button onClick={sendInvite} className="btn-primary">
            Invitar
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
