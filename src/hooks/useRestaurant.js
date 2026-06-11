import { useState, useEffect, useCallback } from 'react'
import { collection, onSnapshot, doc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getUserProfile } from '../lib/restaurantService'

const MOCK_RESTAURANT = {
  id: 'demo',
  name: 'Pizzería Don Pepe',
  description: 'Cocina italiana casera desde 1985',
  ownerUid: null,
  customIngredients: [
    { id: 'demo_pepperoni', name: 'Pepperoni', emoji: '🍕', category: 'protein', price: 3.50, groups: ['graso', 'salado', 'intenso'] },
    { id: 'demo_albahaca', name: 'Albahaca', emoji: '🌿', category: 'condiment', price: 1.00, groups: ['fresco', 'aromatico', 'verde'] },
    { id: 'demo_mozzarella', name: 'Mozzarella', emoji: '🧀', category: 'dairy', price: 2.50, groups: ['lacteo', 'cremoso', 'suave'] },
    { id: 'demo_oregano', name: 'Orégano', emoji: '🌿', category: 'condiment', price: 0.50, groups: ['aromatico', 'intenso', 'seco'] },
    { id: 'demo_aceituna', name: 'Aceituna', emoji: '🫒', category: 'condiment', price: 1.50, groups: ['salado', 'graso', 'intenso'] },
  ],
  customRecipes: [
    {
      id: 'demo_pizza',
      ingredientIds: ['demo_pepperoni', 'demo_mozzarella', 'demo_albahaca', 'demo_oregano'],
      name: 'Pizza Pepperoni Don Pepe',
      emoji: '🍕',
      description: 'Pizza artesanal horneada en horno de leña con pepperoni importado.',
      instructions: 'Estira la masa, añade salsa de tomate casera, mozzarella fresca, pepperoni y hornea a 300°C por 90 segundos.',
      modifiers: ['¿Con extra queso? (+$2)', '¿Sin pepperoni?', '¿Borde relleno? (+$3)', '¿Doble salsa?'],
      price: 12.90,
    },
    {
      id: 'demo_ensalada',
      ingredientIds: ['ing_009', 'demo_aceituna', 'demo_mozzarella', 'demo_albahaca'],
      name: 'Ensalada Caprese Don Pepe',
      emoji: '🥗',
      description: 'Ensalada caprese con mozzarella de búfala y aceitunas.',
      instructions: 'Corta la mozzarella en rodajas, alterna con la lechuga y las aceitunas. Aliña con aceite de oliva, sal y albahaca fresca.',
      modifiers: ['¿Con vinagre balsámico?', '¿Sin aceitunas?', '¿Con tomate cherry? (+$1.50)'],
      price: 8.50,
    },
  ],
}

function getFromLocal(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

function setToLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* */ }
}

export default function useRestaurant(user) {
  const [restaurant, setRestaurant] = useState(null)
  const [customIngredients, setCustomIngredients] = useState([])
  const [customRecipes, setCustomRecipes] = useState([])
  const [customStyles, setCustomStyles] = useState([])
  const [disabledIngredientIds, setDisabledIngredientIds] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  const isOwner = restaurant
    ? restaurant.ownerUid === user?.uid || userRole === 'restaurant'
    : false

  useEffect(() => {
    if (!user) {
      setRestaurant(null)
      setCustomIngredients([])
      setCustomRecipes([])
      setIsFollowing(false)
      setUserRole(null)
      setLoading(false)
      return
    }

    getUserProfile(user.uid).then(profile => {
      if (profile?.role) setUserRole(profile.role)
    })

    const storedFlg = getFromLocal(`kf_following_${user.uid}`)
    if (storedFlg) setIsFollowing(true)

    if (!db) {
      setLoading(false)
      return
    }

    const stored = getFromLocal(`kf_restaurant_${user.uid}`)
    if (stored) {
      setRestaurant(stored.restaurant)
      setCustomIngredients(stored.customIngredients || [])
      setCustomRecipes(stored.customRecipes || [])
      setCustomStyles(stored.customStyles || [])
      setLoading(false)
      return
    }

    const unsub = onSnapshot(
      collection(db, 'restaurants'),
      async (snap) => {
        for (const docSnap of snap.docs) {
          const data = docSnap.data()
          if (data.ownerUid === user.uid) {
            const ingsSnap = await getDocs(collection(docSnap.ref, 'customIngredients'))
            const recsSnap = await getDocs(collection(docSnap.ref, 'customRecipes'))
            const stylesSnap = await getDocs(collection(docSnap.ref, 'dishStyles'))
            const r = { id: docSnap.id, ...data }
            const ings = ingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            const recs = recsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            const styles = stylesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            setRestaurant(r)
            setCustomIngredients(ings)
            setCustomRecipes(recs)
            setCustomStyles(styles)
            setDisabledIngredientIds(data.disabledIngredientIds || [])
            setToLocal(`kf_restaurant_${user.uid}`, { restaurant: r, customIngredients: ings, customRecipes: recs, customStyles: styles })
            break
          }
        }
        setLoading(false)
      },
      () => { setLoading(false) }
    )
    return unsub
  }, [user])

  const followDemo = useCallback(() => {
    setRestaurant(MOCK_RESTAURANT)
    setCustomIngredients(MOCK_RESTAURANT.customIngredients)
    setCustomRecipes(MOCK_RESTAURANT.customRecipes)
    setIsFollowing(true)
    if (user) setToLocal(`kf_following_${user.uid}`, true)
  }, [user])

  const unfollow = useCallback(() => {
    setRestaurant(null)
    setCustomIngredients([])
    setCustomRecipes([])
    setCustomStyles([])
    setIsFollowing(false)
    if (user) localStorage.removeItem(`kf_following_${user.uid}`)
  }, [user])

  const refresh = useCallback(async () => {
    if (!db || !restaurant?.id) return
    const rRef = doc(db, 'restaurants', restaurant.id)
    const ingsSnap = await getDocs(collection(rRef, 'customIngredients'))
    const recsSnap = await getDocs(collection(rRef, 'customRecipes'))
    const stylesSnap = await getDocs(collection(rRef, 'dishStyles'))
    const ings = ingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const recs = recsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const styles = stylesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setCustomIngredients(ings)
    setCustomRecipes(recs)
    setCustomStyles(styles)
    setToLocal(`kf_restaurant_${user?.uid}`, { restaurant, customIngredients: ings, customRecipes: recs, customStyles: styles })
  }, [db, restaurant, user])

  return {
    restaurant,
    customIngredients,
    customRecipes,
    customStyles,
    disabledIngredientIds,
    isFollowing,
    isOwner,
    userRole,
    loading,
    followDemo,
    unfollow,
    refresh,
  }
}
