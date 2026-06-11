import { useState, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'
import AdminIngredients from './AdminIngredients'
import AdminRecipes from './AdminRecipes'
import AdminStyles from './AdminStyles'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function AdminPanel({ restaurant, customIngredients, customRecipes, customStyles, onRefresh, user }) {
  const [tab, setTab] = useState('ingredients')

  const handleAddIngredient = useCallback(async (ingredient) => {
    if (!db || !restaurant?.id) return
    await addDoc(collection(db, 'restaurants', restaurant.id, 'customIngredients'), {
      ...ingredient,
      createdAt: serverTimestamp(),
    })
    onRefresh()
  }, [restaurant, onRefresh])

  const handleDeleteIngredient = useCallback(async (id) => {
    if (!db || !restaurant?.id) return
    await deleteDoc(doc(db, 'restaurants', restaurant.id, 'customIngredients', id))
    onRefresh()
  }, [restaurant, onRefresh])

  const handleAddRecipe = useCallback(async (recipe) => {
    if (!db || !restaurant?.id) return
    await addDoc(collection(db, 'restaurants', restaurant.id, 'customRecipes'), {
      ...recipe,
      ingredientIds: [...recipe.ingredientIds].sort(),
      createdAt: serverTimestamp(),
    })
    onRefresh()
  }, [restaurant, onRefresh])

  const handleDeleteRecipe = useCallback(async (id) => {
    if (!db || !restaurant?.id) return
    await deleteDoc(doc(db, 'restaurants', restaurant.id, 'customRecipes', id))
    onRefresh()
  }, [restaurant, onRefresh])

  const handleAddStyle = useCallback(async (style) => {
    if (!db || !restaurant?.id) return
    await addDoc(collection(db, 'restaurants', restaurant.id, 'dishStyles'), {
      ...style,
      createdAt: serverTimestamp(),
    })
    onRefresh()
  }, [restaurant, onRefresh])

  const handleDeleteStyle = useCallback(async (id) => {
    if (!db || !restaurant?.id) return
    await deleteDoc(doc(db, 'restaurants', restaurant.id, 'dishStyles', id))
    onRefresh()
  }, [restaurant, onRefresh])

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <h2 className="font-title text-xl font-extrabold text-primary">🛠️ Panel de Administración</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{restaurant?.name}</span>
          <a href="#/" className="text-sm text-primary hover:underline font-medium">← Volver al canvas</a>
        </div>
      </div>

      <div className="px-6 pt-4 border-b border-border">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="ingredients">🥕 Ingredientes ({customIngredients.length})</TabsTrigger>
            <TabsTrigger value="recipes">📖 Recetas ({customRecipes.length})</TabsTrigger>
            <TabsTrigger value="styles">🎨 Estilos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <TabsContent value="ingredients">
          <AdminIngredients
            ingredients={customIngredients}
            onAdd={handleAddIngredient}
            onDelete={handleDeleteIngredient}
          />
        </TabsContent>
        <TabsContent value="recipes">
          <AdminRecipes
            recipes={customRecipes}
            ingredients={customIngredients}
            onAdd={handleAddRecipe}
            onDelete={handleDeleteRecipe}
          />
        </TabsContent>
        <TabsContent value="styles">
          <AdminStyles
            customStyles={customStyles}
            onAdd={handleAddStyle}
            onDelete={handleDeleteStyle}
          />
        </TabsContent>
      </div>
    </div>
  )
}
