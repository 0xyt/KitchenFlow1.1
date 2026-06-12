import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth, redirectResolver } from '../lib/firebase'
import useUserRole from '../hooks/useUserRole'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    if (!auth) {
      console.warn('[Auth] Firebase auth no disponible')
      setAuthLoading(false)
      return
    }

    // Procesar resultado de redirect OAuth (vuelta de Google)
    getRedirectResult(auth, redirectResolver)
      .then((result) => {
        if (result) {
          console.log('[Auth] Redirect exitoso:', result.user.displayName)
          setUser(result.user)
        } else {
          console.log('[Auth] Sin redirect pendiente')
        }
      })
      .catch((err) => {
        console.error('[Auth] Error en redirect:', err.code, err.message)
      })

    // Verificar si ya hay sesión activa
    if (auth.currentUser) {
      console.log('[Auth] Sesión activa en currentUser:', auth.currentUser.displayName)
      setUser(auth.currentUser)
    }

    // Escuchar cambios de autenticación
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('[Auth] onAuthStateChanged:', u ? u.displayName : 'null (sesión cerrada)')
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
