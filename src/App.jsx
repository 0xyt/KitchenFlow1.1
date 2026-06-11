import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './lib/firebase'
import FlowCanvas from './components/Canvas/FlowCanvas'
import LoginButton from './components/Auth/LoginButton'
import ThemeToggle from './components/ThemeToggle'
import SoundToggle from './components/SoundToggle'
import AdminPanel from './pages/AdminPanel'
import PlateBuilder from './components/restaurant/PlateBuilder'
import MenuView from './components/restaurant/MenuView'
import ingredientsData from './data/ingredients.json'
import useTheme from './hooks/useTheme'
import useSound from './hooks/useSound'
import useRestaurant from './hooks/useRestaurant'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'

function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-primary text-white rounded-[12px] shadow-lg shadow-primary/20 text-sm font-semibold"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MainApp({ user, isAdmin, onSaveFavorite, sounds, restaurantCtx }) {
  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card card-shadow z-20">
        <h1 className="font-title text-2xl font-extrabold text-primary flex items-center gap-2">
          <span>🧑‍🍳</span>
          KitchenFlow
        </h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <a
                href="#/builder"
                className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-[8px] hover:bg-primary/20 transition-all"
              >
                🧑‍🍳 Crear plato
              </a>
              <a
                href="#/admin"
                className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-[8px] hover:bg-primary/20 transition-all"
              >
                🛠️ Admin
              </a>
            </>
          )}
          <SoundToggle muted={sounds.muted} toggle={sounds.toggleMute} />
          <ThemeToggle isDark={useTheme().isDark} toggle={useTheme().toggle} />
          <LoginButton user={user} />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <FlowCanvas
          user={user}
          onSaveFavorite={onSaveFavorite}
          sounds={sounds}
          restaurantCtx={restaurantCtx}
        />
      </main>
    </div>
  )
}

export default function App() {
  const [toast, setToast] = useState({ message: '', visible: false })
  const [route, setRoute] = useState(() => window.location.hash || '#/')
  const { user, role, isAdmin, isSuperAdmin, loading } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const sounds = useSound()
  const restaurantCtx = useRestaurant(user)

  useEffect(() => {
    const handler = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const showToast = useCallback((message) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 2500)
  }, [])

  const handleSaveFavorite = useCallback(async (recipe) => {
    if (!user || !recipe || !db) return
    try {
      await addDoc(collection(db, 'users', user.uid, 'favorites'), {
        userId: user.uid,
        ingredientIds: recipe.ingredients.map(i => i.id),
        dishName: recipe.name,
        createdAt: serverTimestamp(),
      })
      showToast('⭐ ¡Guardado en favoritos!')
    } catch (error) {
      showToast('Error al guardar. Intenta de nuevo.')
    }
  }, [user, showToast])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (route === '#/unauthorized') {
    return <Unauthorized />
  }

  if (route === '#/admin') {
    return (
      <ProtectedRoute requiredRole="restaurant_admin">
        <div className="h-screen bg-[hsl(var(--background))]">
          <AdminPanel
            restaurant={restaurantCtx.restaurant}
            customIngredients={restaurantCtx.customIngredients}
            customRecipes={restaurantCtx.customRecipes}
            customStyles={restaurantCtx.customStyles}
            onRefresh={restaurantCtx.refresh}
            user={user}
          />
          <Toast message={toast.message} visible={toast.visible} />
        </div>
      </ProtectedRoute>
    )
  }

  if (route === '#/builder') {
    return (
      <ProtectedRoute requiredRole="restaurant_admin">
        <div className="h-screen bg-[hsl(var(--background))]">
          <PlateBuilder
            user={user}
            restaurant={restaurantCtx.restaurant}
            customIngredients={restaurantCtx.customIngredients}
            customRecipes={restaurantCtx.customRecipes}
            customStyles={restaurantCtx.customStyles}
            onPublished={(plate) => showToast(`📢 ¡${plate.name} publicado en el menú!`)}
          />
          <Toast message={toast.message} visible={toast.visible} />
        </div>
      </ProtectedRoute>
    )
  }

  if (route.startsWith('#/menu')) {
    return (
      <div className="h-screen bg-[hsl(var(--background))]">
        <MenuView
          restaurant={restaurantCtx.restaurant}
          plates={restaurantCtx.customRecipes.map(r => ({
            ...r,
            ingredients: (r.ingredientIds || []).map(id => {
              const all = [...(restaurantCtx.customIngredients || []),             ...ingredientsData]
              return all.find(i => i.id === id)
            }).filter(Boolean),
          }))}
          isOwner={isAdmin}
        />
        <Toast message={toast.message} visible={toast.visible} />
      </div>
    )
  }

  return (
    <MainApp
      user={user}
      isAdmin={isAdmin}
      onSaveFavorite={handleSaveFavorite}
      sounds={sounds}
      restaurantCtx={restaurantCtx}
    />
  )
}
