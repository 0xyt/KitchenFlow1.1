import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import useUserRole from '../hooks/useUserRole'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (auth?.currentUser) {
      console.log('[Auth] Initial user from currentUser:', auth.currentUser.displayName)
      return auth.currentUser
    }
    return null
  })
  const [authLoading, setAuthLoading] = useState(!auth?.currentUser)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    if (!auth) {
      console.warn('[Auth] Firebase auth no disponible')
      setAuthLoading(false)
      return
    }

    console.log('[Auth] Suscribiendo onAuthStateChanged...')
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log('[Auth] Usuario autenticado:', u.displayName, u.email)
      } else {
        console.log('[Auth] Sesión cerrada')
      }
      setUser(u)
      setAuthLoading(false)
    })

    return unsub
  }, [])

  const { role, restaurantId, isAdmin, isConsumer, isSuperAdmin, loading: roleLoading } = useUserRole(user)

  const loading = authLoading || (!!user && !!auth && roleLoading)

  const value = {
    user,
    userProfile: user
      ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }
      : null,
    role,
    restaurantId,
    isAdmin,
    isConsumer,
    isSuperAdmin,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
