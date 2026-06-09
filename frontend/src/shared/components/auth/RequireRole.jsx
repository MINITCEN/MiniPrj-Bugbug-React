import { Navigate } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/useAuthStore'

export default function RequireRole({ role, children }) {
  const { user, isLoggedIn, isLoading } = useAuthStore()

  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  const allowedRoles = Array.isArray(role) ? role : [role]
  const hasPermission = allowedRoles.includes(user?.role)

  if (!hasPermission) {
    return <Navigate to="/mypage/dashboard" replace />
  }

  return children
}