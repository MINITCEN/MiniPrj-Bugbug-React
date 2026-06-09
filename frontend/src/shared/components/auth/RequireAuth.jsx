import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/useAuthStore'


export default function RequireAuth({ children }) {
  const { isLoggedIn, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}