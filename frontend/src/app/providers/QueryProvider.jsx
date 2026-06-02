import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import axios from 'axios'
import useAuthStore from '../../features/auth/store/useAuthStore'

const queryClient = new QueryClient()

/**
 * 부팅 시 1회 silent refresh 시도.
 *
 * 새로고침/탭 닫힘으로 메모리의 accessToken은 휘발되지만, refresh 쿠키는 브라우저가
 * 유지하고 있으므로 /api/auth/refresh로 access를 재발급받아 로그인 상태를 복구한다.
 *
 * - axios 기본 인스턴스 말고 raw axios로 호출 (interceptor 재귀 회피).
 *   기본 인스턴스로 호출하면 응답 401 시 interceptor가 다시 refresh를 트리거해 무한 루프.
 * - refresh 실패 시(쿠키 없음 / 만료) 비로그인 상태로 표시만 하고 끝냄.
 */
function AuthInitializer() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const fetchMe = useAuthStore((state) => state.fetchMe)

  useEffect(() => {
    let cancelled = false
    axios
      .post('/api/auth/refresh', null, { withCredentials: true })
      .then((res) => {
        if (cancelled) return
        setAccessToken(res.data.accessToken)
        return fetchMe()
      })
      .catch(() => {
        if (cancelled) return
        useAuthStore.setState({ isLoading: false })
      })
    return () => {
      cancelled = true
    }
  }, [setAccessToken, fetchMe])

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
