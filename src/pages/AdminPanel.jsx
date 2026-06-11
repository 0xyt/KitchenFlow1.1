import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Package, ClipboardList, Palette, Users,
  ChevronLeft, ChevronRight, Plus, X, Search, Upload,
  Eye, EyeOff, Trash2, Edit3, Save, Star, LogOut,
} from 'lucide-react'
import {
  doc, setDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, getDoc, query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import ingredientsData from '../data/ingredients.json'

const TABS = [
  { id: 'restaurant', label: 'Mi Restaurante', icon: Store },
  { id: 'ingredients', label: 'Ingredientes', icon: Package },
  { id: 'menu', label: 'Mi Menú', icon: ClipboardList },
  { id: 'styles', label: 'Estilos de Plato', icon: Palette },
  { id: 'team', label: 'Mi Equipo', icon: Users },
]

const PRESET_COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899']
const CATEGORIES = ['verdura', 'carne', 'pescado', 'lácteo', 'especia', 'líquido', 'carbohidrato', 'fruta', 'otro']
const STYLE_TEMPLATES = [
  { id: 'sandwich', name: 'Sandwich', emoji: '🥪' },
  { id: 'salad', name: 'Ensalada', emoji: '🥗' },
  { id: 'bowl', name: 'Bowl', emoji: '🥣' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'wrap', name: 'Wrap', emoji: '🌯' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
]

function TabButton({ tab, active, collapsed, onClick }) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-[8px] ${
        active
          ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
          : 'text-[#A0A0B8] hover:bg-[#1A1A2E] hover:text-white'
      }`}
      title={collapsed ? tab.label : undefined}
    >
      <Icon size={20} />
      {!collapsed && <span>{tab.label}</span>}
    </button>
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
    <div className="flex flex-wrap gap-1.5 p-2 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
      {chips.map((c, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs rounded-full">
          {c}
          <button onClick={() => onChange(chips.filter((_, j) => j !== i))} className="hover:text-white">
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
        className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-[#4A4A5E] outline-none"
      />
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-[#1A1A2E] border border-[#2D2D4E] rounded-[12px] p-5">
      {title && <h3 className="font-title text-base font-bold text-white mb-4">{title}</h3>}
      {children}
    </div>
  )
}

export default function AdminPanel({ onNavigateHome }) {
  const { user, restaurantId } = useAuth()
  const [activeTab, setActiveTab] = useState('restaurant')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  return (
    <div className="h-screen flex bg-[#0F0F1A] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-[#2D2D4E] bg-[#1A1A2E] transition-all duration-200 ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'}`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#2D2D4E]">
          {!sidebarCollapsed && (
            <span className="font-title text-sm font-bold text-white truncate">Admin</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-[8px] text-[#A0A0B8] hover:bg-[#0F0F1A] hover:text-white transition-all"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {TABS.map(tab => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              collapsed={sidebarCollapsed}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>
        <div className="p-2 border-t border-[#2D2D4E]">
          <a
            href="#/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#A0A0B8] hover:bg-[#0F0F1A] hover:text-white rounded-[8px] transition-all"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Volver</span>}
          </a>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 h-14 border-b border-[#2D2D4E] bg-[#1A1A2E] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{TABS.find(t => t.id === activeTab)?.icon && React.createElement(TABS.find(t => t.id === activeTab).icon, { size: 22, className: 'text-[#8B5CF6]' })}</span>
            <h2 className="font-title text-lg font-bold text-white">{TABS.find(t => t.id === activeTab)?.label}</h2>
          </div>
          {restaurantId && (
            <span className="text-xs text-[#4A4A5E] font-mono">ID: {restaurantId.slice(0, 8)}...</span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'restaurant' && <RestaurantTab user={user} restaurantId={restaurantId} showToast={showToast} />}
              {activeTab === 'ingredients' && <IngredientsTab restaurantId={restaurantId} showToast={showToast} />}
              {activeTab === 'menu' && <MenuTab restaurantId={restaurantId} showToast={showToast} />}
              {activeTab === 'styles' && <StylesTab restaurantId={restaurantId} showToast={showToast} />}
              {activeTab === 'team' && <TeamTab restaurantId={restaurantId} showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#8B5CF6] text-white rounded-[12px] shadow-lg shadow-[#8B5CF6]/20 text-sm font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============ TAB: MI RESTAURANTE ============ */
function RestaurantTab({ user, restaurantId, showToast }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6')
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const loadedRef = useRef(false)

  useState(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    if (!db || !restaurantId) return
    getDoc(doc(db, 'restaurants', restaurantId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setName(d.name || '')
        setDescription(d.description || '')
        setPrimaryColor(d.primaryColor || '#8B5CF6')
        setLogoPreview(d.logoURL || null)
      }
    })
  }, [restaurantId])

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !storage || !restaurantId) return
    try {
      const path = `restaurants/${restaurantId}/logo`
      const ref = storageRef(storage, path)
      await uploadBytes(ref, file)
      const url = await getDownloadURL(ref)
      setLogoPreview(url)
      showToast('Logo subido')
    } catch (err) {
      showToast('Error al subir logo: ' + err.message)
    }
  }

  const handleSave = async () => {
    if (!db || !restaurantId) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'restaurants', restaurantId), {
        name, description, primaryColor, logoURL: logoPreview,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      showToast('Restaurante actualizado')
    } catch (err) {
      showToast('Error: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <SectionCard title="Información del Restaurante">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A0A0B8] mb-1">Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
          </div>
          <div>
            <label className="block text-sm text-[#A0A0B8] mb-1">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6] resize-none" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Logo">
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <img src={logoPreview} alt="logo" className="w-20 h-20 rounded-[12px] object-cover border border-[#2D2D4E]" />
          ) : (
            <div className="w-20 h-20 rounded-[12px] bg-[#0F0F1A] border border-[#2D2D4E] flex items-center justify-center text-[#4A4A5E]">
              <Store size={28} />
            </div>
          )}
          <input type="file" ref={fileRef} onChange={handleLogo} accept="image/*" className="hidden" />
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/15 text-[#8B5CF6] rounded-[8px] text-sm font-medium hover:bg-[#8B5CF6]/25 transition-all">
            <Upload size={16} /> Subir logo
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Color Primario">
        <div className="flex gap-3">
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => setPrimaryColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </SectionCard>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#8B5CF6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#7C3AED] transition-all disabled:opacity-50">
        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
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

  useState(() => {
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

  const filteredGlobals = ingredientsData.filter(i =>
    i.nombre?.toLowerCase().includes(search.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      <SectionCard title="Ingredientes Globales">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A4A5E]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ingredientes..."
            className="w-full pl-9 pr-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
        </div>
        <p className="text-xs text-[#4A4A5E] mb-3">Toggle para mostrar/ocultar ingredientes en todo el sistema:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredGlobals.map(ing => {
            const isDisabled = disabledIngredientIds.includes(ing.id)
            return (
              <div key={ing.id} className={`flex items-center gap-2 px-3 py-2 bg-[#0F0F1A] rounded-[8px] border transition-all ${isDisabled ? 'border-[#EF4444]/30 opacity-50' : 'border-[#2D2D4E]'}`}>
                <span className="text-lg">{ing.emoji}</span>
                <span className={`text-sm flex-1 truncate ${isDisabled ? 'text-[#4A4A5E] line-through' : 'text-white'}`}>{ing.nombre}</span>
                <span className="text-[10px] text-[#4A4A5E] uppercase hidden md:inline">{ing.category}</span>
                <button onClick={() => toggleIngredient(ing.id)} className={`p-1 rounded transition-all ${isDisabled ? 'text-[#EF4444] hover:text-white' : 'text-[#10B981] hover:text-white'}`}>
                  {isDisabled ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title={`Mis Ingredientes (${customIngs.length})`}>
        <div className="space-y-2 mb-4">
          {customIngs.map(ing => (
            <div key={ing.id} className="flex items-center gap-3 px-3 py-2 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
              <span className="text-lg">{ing.emoji || '🧂'}</span>
              <span className="text-sm text-white flex-1">{ing.name}</span>
              <span className="text-xs text-[#4A4A5E] uppercase">{ing.category}</span>
              <span className="text-xs font-mono text-[#F59E0B]">${(ing.price || 0).toFixed(2)}</span>
              <button onClick={() => startEdit(ing)} className="p-1 text-[#A0A0B8] hover:text-[#8B5CF6]"><Edit3 size={14} /></button>
              <button onClick={() => handleDelete(ing.id)} className="p-1 text-[#A0A0B8] hover:text-[#EF4444]"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="space-y-3 p-4 bg-[#0F0F1A] rounded-[8px] border border-[#8B5CF6]/30 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre"
                className="px-3 py-2 bg-[#1A1A2E] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
              <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="Emoji"
                className="px-3 py-2 bg-[#1A1A2E] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 bg-[#1A1A2E] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} placeholder="Precio"
                className="px-3 py-2 bg-[#1A1A2E] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
            </div>
            <div>
              <label className="block text-xs text-[#A0A0B8] mb-1">Tags</label>
              <ChipInput chips={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} placeholder="Escribe y presiona Enter" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit}
                className="px-4 py-2 bg-[#8B5CF6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#7C3AED] transition-all">
                {editingId ? 'Actualizar' : 'Agregar'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', emoji: '', category: 'otro', price: 0, tags: [] }) }}
                className="px-4 py-2 bg-[#2D2D4E] text-[#A0A0B8] rounded-[8px] text-sm hover:text-white transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/15 text-[#8B5CF6] rounded-[8px] text-sm font-medium hover:bg-[#8B5CF6]/25 transition-all">
            <Plus size={16} /> Nuevo ingrediente
          </button>
        )}
      </SectionCard>
    </div>
  )
}

/* ============ TAB: MI MENÚ ============ */
function MenuTab({ restaurantId, showToast }) {
  const [plates, setPlates] = useState([])
  const [menuPublic, setMenuPublic] = useState(false)
  const [editing, setEditing] = useState(null)
  const loadedRef = useRef(false)

  useState(() => {
    if (loadedRef.current || !db || !restaurantId) return
    loadedRef.current = true
    onSnapshot(collection(db, 'restaurants', restaurantId, 'recipes'), snap => {
      setPlates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) setMenuPublic(snap.data().menuPublic || false)
    })
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
      <div className="flex items-center justify-between bg-[#1A1A2E] border border-[#2D2D4E] rounded-[12px] p-4">
        <div>
          <h3 className="font-title text-sm font-bold text-white">Menú Público</h3>
          <p className="text-xs text-[#A0A0B8] mt-1">Los clientes podrán ver los platos publicados</p>
        </div>
        <button onClick={toggleMenuPublic}
          className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-all ${
            menuPublic ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#2D2D4E] text-[#A0A0B8]'
          }`}>
          {menuPublic ? <Eye size={16} /> : <EyeOff size={16} />}
          {menuPublic ? 'Visible' : 'Oculto'}
        </button>
      </div>

      <div className="space-y-3">
        {plates.map(plate => (
          <div key={plate.id} className="bg-[#1A1A2E] border border-[#2D2D4E] rounded-[12px] p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{plate.emoji || '🍽️'}</span>
              {editing?.id === plate.id ? (
                <div className="flex-1 flex gap-2">
                  <input value={editing.name} onChange={e => setEditing(e => ({ ...e, name: e.target.value }))}
                    className="flex-1 px-2 py-1 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[6px] text-white text-sm outline-none" />
                  <input type="number" step="0.01" value={editing.price} onChange={e => setEditing(e => ({ ...e, price: parseFloat(e.target.value) || 0 }))}
                    className="w-20 px-2 py-1 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[6px] text-white text-sm outline-none" />
                  <button onClick={() => handleEditName(plate.id)} className="p-1.5 text-[#10B981]"><Save size={14} /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 text-[#A0A0B8]"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white">{plate.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(plate.ingredientIds || []).slice(0, 4).map(id => {
                        const ing = allIngredients.find(i => i.id === id)
                        return ing ? (
                          <span key={id} className="px-1.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] rounded-full">{ing.emoji} {ing.nombre}</span>
                        ) : null
                      })}
                      {(plate.ingredientIds || []).length > 4 && (
                        <span className="text-[10px] text-[#4A4A5E]">+{(plate.ingredientIds || []).length - 4}</span>
                      )}
                    </div>
                  </div>
                  {plate.style && (
                    <span className="text-xs text-[#A0A0B8] bg-[#0F0F1A] px-2 py-1 rounded-full">{plate.style}</span>
                  )}
                  <span className="font-mono text-sm text-[#F59E0B] font-medium">${(plate.price || 0).toFixed(2)}</span>
                  <button onClick={() => setEditing({ id: plate.id, name: plate.name, price: plate.price })} className="p-1.5 text-[#A0A0B8] hover:text-[#8B5CF6]"><Edit3 size={14} /></button>
                  <button onClick={() => togglePublish(plate)} className={`p-1.5 ${plate.isPublic ? 'text-[#10B981]' : 'text-[#A0A0B8]'} hover:text-white`}>
                    {plate.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(plate.id)} className="p-1.5 text-[#A0A0B8] hover:text-[#EF4444]"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {plates.length === 0 && (
          <p className="text-sm text-[#4A4A5E] text-center py-8">Sin platos aún. Crea combinaciones desde el canvas.</p>
        )}
      </div>
    </div>
  )
}

/* ============ TAB: ESTILOS DE PLATO ============ */
function StylesTab({ restaurantId, showToast }) {
  const [activeStyles, setActiveStyles] = useState({})
  const [basePrices, setBasePrices] = useState({})
  const [customStyles, setCustomStyles] = useState([])
  const [newStyleName, setNewStyleName] = useState('')
  const [newStyleEmoji, setNewStyleEmoji] = useState('')
  const loadedRef = useRef(false)

  useState(() => {
    if (loadedRef.current || !db || !restaurantId) return
    loadedRef.current = true
    onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) {
        const d = snap.data()
        setActiveStyles(d.styleActive || {})
        setBasePrices(d.stylePrices || {})
      }
    })
    onSnapshot(collection(db, 'restaurants', restaurantId, 'customStyles'), snap => {
      setCustomStyles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [restaurantId])

  const toggleStyle = async (styleId) => {
    if (!db || !restaurantId) return
    const next = { ...activeStyles, [styleId]: !activeStyles[styleId] }
    await setDoc(doc(db, 'restaurants', restaurantId), { styleActive: next }, { merge: true })
    setActiveStyles(next)
  }

  const updatePrice = async (styleId, price) => {
    if (!db || !restaurantId) return
    const next = { ...basePrices, [styleId]: price }
    await setDoc(doc(db, 'restaurants', restaurantId), { stylePrices: next }, { merge: true })
    setBasePrices(next)
  }

  const addCustomStyle = async () => {
    if (!db || !restaurantId || !newStyleName.trim()) return
    try {
      await addDoc(collection(db, 'restaurants', restaurantId, 'customStyles'), {
        name: newStyleName.trim(), emoji: newStyleEmoji || '🎨', createdAt: serverTimestamp(),
      })
      setNewStyleName('')
      setNewStyleEmoji('')
      showToast('Estilo personalizado agregado')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  const deleteCustomStyle = async (id) => {
    if (!db || !restaurantId) return
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'customStyles', id))
      showToast('Estilo eliminado')
    } catch (err) { showToast('Error: ' + err.message) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <SectionCard title="Estilos Predefinidos">
        <div className="space-y-3">
          {STYLE_TEMPLATES.map(st => (
            <div key={st.id} className="flex items-center gap-3 px-4 py-3 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E]">
              <span className="text-2xl">{st.emoji}</span>
              <span className="text-sm text-white flex-1 font-medium">{st.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A0A0B8]">$</span>
                <input type="number" step="0.01" value={basePrices[st.id] || ''}
                  onChange={e => updatePrice(st.id, parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-20 px-2 py-1 bg-[#1A1A2E] border border-[#2D2D4E] rounded-[6px] text-white text-sm outline-none text-center font-mono" />
              </div>
              <button onClick={() => toggleStyle(st.id)}
                className={`relative w-10 h-5 rounded-full transition-all ${activeStyles[st.id] ? 'bg-[#8B5CF6]' : 'bg-[#2D2D4E]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${activeStyles[st.id] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Estilos Personalizados">
        {customStyles.map(cs => (
          <div key={cs.id} className="flex items-center gap-3 px-4 py-3 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E] mb-2">
            <span className="text-2xl">{cs.emoji}</span>
            <span className="text-sm text-white flex-1">{cs.name}</span>
            <button onClick={() => deleteCustomStyle(cs.id)} className="p-1 text-[#A0A0B8] hover:text-[#EF4444]"><Trash2 size={14} /></button>
          </div>
        ))}
        {customStyles.length === 0 && (
          <p className="text-sm text-[#4A4A5E] mb-4">Sin estilos personalizados aún.</p>
        )}
        <div className="flex gap-2">
          <input value={newStyleName} onChange={e => setNewStyleName(e.target.value)} placeholder="Nombre del estilo"
            className="flex-1 px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
          <input value={newStyleEmoji} onChange={e => setNewStyleEmoji(e.target.value)} placeholder="Emoji"
            className="w-16 px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm text-center outline-none focus:border-[#8B5CF6]" />
          <button onClick={addCustomStyle}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/15 text-[#8B5CF6] rounded-[8px] text-sm font-medium hover:bg-[#8B5CF6]/25 transition-all">
            <Plus size={16} /> Agregar
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

/* ============ TAB: MI EQUIPO ============ */
function TeamTab({ restaurantId, showToast }) {
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const loadedRef = useRef(false)

  useState(() => {
    if (loadedRef.current || !db || !restaurantId) return
    loadedRef.current = true
    onSnapshot(doc(db, 'restaurants', restaurantId), snap => {
      if (snap.exists()) {
        setMembers(snap.data().members || [])
      }
    })
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
    <div className="max-w-2xl space-y-6">
      <SectionCard title={`Miembros (${members.length})`}>
        {members.map(m => (
          <div key={m.uid} className="flex items-center gap-3 px-4 py-3 bg-[#0F0F1A] rounded-[8px] border border-[#2D2D4E] mb-2">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-sm font-bold">
              {(m.name || m.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{m.name || m.email}</p>
              <p className="text-[10px] text-[#4A4A5E]">{m.role}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              m.role === 'chef' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'bg-[#2D2D4E] text-[#A0A0B8]'
            }`}>
              {m.role}
            </span>
            <button onClick={() => revokeMember(m.uid)} className="p-1.5 text-[#A0A0B8] hover:text-[#EF4444]"><LogOut size={14} /></button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-[#4A4A5E] text-center py-4">Sin miembros aún.</p>
        )}
      </SectionCard>

      <SectionCard title="Invitar Miembro">
        <div className="flex gap-2">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com"
            className="flex-1 px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
            className="px-3 py-2 bg-[#0F0F1A] border border-[#2D2D4E] rounded-[8px] text-white text-sm outline-none focus:border-[#8B5CF6]">
            <option value="staff">Staff</option>
            <option value="chef">Chef</option>
          </select>
          <button onClick={sendInvite}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#7C3AED] transition-all">
            Invitar
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
