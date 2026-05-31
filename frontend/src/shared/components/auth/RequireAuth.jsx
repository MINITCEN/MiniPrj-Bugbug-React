import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/useAuthStore'

/**
 * 로그인이 필요한 라우트를 감싸는 가드 컴포넌트.
 *
 *   <RequireAuth>
 *     <MyPageLayout />
 *   </RequireAuth>
 *
 * 동작 흐름:
 *  1. 초기 로드 중(isLoading)이면 잠깐 빈 화면 — fetchMe()가 끝나기를 기다림
 *  2. 로그인 안 했으면 /login으로 이동하면서 원래 가려던 경로를 state로 전달
 *     → 로그인 후 그 페이지로 돌아갈 수 있도록
 *  3. 로그인 했으면 children 렌더링
 *
 * ⚠️ 이 가드는 UX용입니다. 실제 권한 검증은 백엔드 @PreAuthorize가 담당합니다.
 */
export default function RequireAuth({ children }) {
  const { isLoggedIn, isLoading } = useAuthStore()
  const location = useLocation()

  // 새로고침 시 fetchMe() 응답을 기다리는 동안 잠깐 user=null인 구간이 있음.
  // 이때 가드가 작동하면 새로고침 할 때마다 /login으로 튕겨버리는 버그가 생김.
  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}