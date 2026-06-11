import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function useSaveRecipe() {
  const { user, restaurantId } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || !db) {
      setSavedRecipes([])
      return
    }
    const q = query(collection(db, 'recipes'), where('createdBy', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setSavedRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, (err) => {
      setError(err.message)
    })
    return unsub
  }, [user])

  const saveRecipe = useCallback(async (recipeData) => {
    if (!user || !db) return
    setLoading(true)
    setError(null)
    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recipeData,
        createdBy: user.uid,
        restaurantId: restaurantId || null,
        createdAt: serverTimestamp(),
      })
      setLoading(false)
      return docRef.id
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [user, restaurantId])

  const deleteRecipe = useCallback(async (recipeId) => {
    if (!user || !db) return
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'recipes', recipeId))
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [user])

  const loadSavedRecipes = useCallback(() => {
    return savedRecipes
  }, [savedRecipes])

  return { saveRecipe, savedRecipes, loadSavedRecipes, deleteRecipe, loading, error }
}
