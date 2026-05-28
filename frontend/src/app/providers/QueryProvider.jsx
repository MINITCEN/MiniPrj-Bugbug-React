import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import useAuthStore from '../../features/auth/store/useAuthStore'

const queryClient = new QueryClient()

function AuthInitializer() {
  const fetchMe = useAuthStore((state) => state.fetchMe)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return null
}

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  )
}
