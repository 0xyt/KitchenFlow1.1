import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [restaurantId, setRestaurantId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) {
      setLoading(false)
      return
    }

    const init = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)

        if (!snap.exists()) {
          const restaurantRef = doc(collection(db, 'restaurants'))
          await setDoc(restaurantRef, {
            name: user.displayName + "'s Restaurant",
            ownerUid: user.uid,
            memberIds: [user.uid],
            createdAt: serverTimestamp(),
          })

          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'restaurant_admin',
            restaurantId: restaurantRef.id,
            createdAt: serverTimestamp(),
          })

          setRole('restaurant_admin')
          setRestaurantId(restaurantRef.id)
        } else {
          const data = snap.data()
          setRole(data.role || 'consumer')
          setRestaurantId(data.restaurantId || null)
        }
      } catch (err) {
        console.warn('[useUserRole] Error:', err.message)
      }
      setLoading(false)
    }

    init()
  }, [user])

  return {
    role,
    restaurantId,
    isAdmin: role === 'restaurant_admin' || role === 'superadmin',
    isConsumer: role === 'consumer',
    isSuperAdmin: role === 'superadmin',
    loading,
  }
}
