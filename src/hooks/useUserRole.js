import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
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
  const createdRef = useRef(false)

  useEffect(() => {
    if (!user || !db) {
      setRole(null)
      setRestaurantId(null)
      setLoading(false)
      return
    }

    if (createdRef.current) return
    createdRef.current = true

    const init = async () => {
      const userRef = doc(db, 'users', user.uid)
      const snap = await getDoc(userRef)

      if (!snap.exists()) {
        try {
          const restaurantRef = doc(collection(db, 'restaurants'))
          await setDoc(restaurantRef, {
            name: user.displayName + "'s Restaurant",
            description: '',
            phone: '',
            address: '',
            ownerUid: user.uid,
            memberIds: [user.uid],
            plan: 'free',
            createdAt: serverTimestamp(),
          })

          await setDoc(userRef, {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'restaurant_admin',
            restaurantId: restaurantRef.id,
            createdAt: serverTimestamp(),
          })

          setRole('restaurant_admin')
          setRestaurantId(restaurantRef.id)
        } catch (err) {
          console.warn('[useUserRole] Error creating user+restaurant:', err.message)
          setRole(ROLES.consumer)
          setRestaurantId(null)
        }
      } else {
        const data = snap.data()
        setRole(data.role || ROLES.consumer)
        setRestaurantId(data.restaurantId || null)
      }

      setLoading(false)
    }

    init()
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
