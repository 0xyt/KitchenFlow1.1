import { useAuth } from '../context/AuthContext'

const ROLE_HIERARCHY = {
  consumer: 0,
  restaurant_admin: 1,
  superadmin: 2,
}

function hasRequiredRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0
  return userLevel >= requiredLevel
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F0F1A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm font-body">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!role || !hasRequiredRole(role, requiredRole)) {
    window.location.hash = '#/unauthorized'
    return null
  }

  return children
}
