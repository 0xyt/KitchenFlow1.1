import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const ROLES = {
  consumer: 'consumer',
  restaurant_admin: 'restaurant_admin',
  superadmin: 'superadmin',
}

export default function useUserRole(user) {
  const [role, setRole] = useState(null)
  const [restaurantId, setRestaurantId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !db) {
      setRole(null)
      setRestaurantId(null)
      setLoading(false)
      return
    }

    const userRef = doc(db, 'users', user.uid)

    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setRole(data.role || ROLES.consumer)
          setRestaurantId(data.restaurantId || null)
        } else {
          setDoc(userRef, {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: ROLES.consumer,
            restaurantId: null,
            createdAt: serverTimestamp(),
          })
          setRole(ROLES.consumer)
          setRestaurantId(null)
        }
        setLoading(false)
      },
      (err) => {
        console.warn('useUserRole error:', err.message)
        setRole(ROLES.consumer)
        setRestaurantId(null)
        setLoading(false)
      }
    )

    return unsub
  }, [user])

  return {
    role,
    restaurantId,
    isAdmin: role === ROLES.restaurant_admin || role === ROLES.superadmin,
    isConsumer: role === ROLES.consumer,
    isSuperAdmin: role === ROLES.superadmin,
    loading,
  }
}
