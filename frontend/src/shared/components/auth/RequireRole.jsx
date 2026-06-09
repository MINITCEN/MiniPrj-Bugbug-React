import { Navigate } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/useAuthStore'

/**
 * 특정 role의 사용자만 접근 가능한 라우트를 감싸는 가드.
 *
 *   <RequireRole role="USER">     ...USER만 접근
 *   <RequireRole role="HUNTER">   ...HUNTER만 접근
 *   <RequireRole role={['USER', 'HUNTER']}>   ...둘 중 하나면 OK
 *
 * 동작 흐름:
 *  1. 로딩 중이면 빈 화면 (RequireAuth와 동일)
 *  2. 비로그인 → /login (이 가드가 단독으로 쓰여도 인증까지 자연스럽게 처리)
 *  3. 권한 불일치 → /mypage/dashboard로 (어디로 보낼지는 일단 대시보드로 통일)
 *  4. 권한 일치 → children
 *
 * ⚠️ 이 가드는 UX용입니다. 권한 우회 가능성을 고려해서
 *     백엔드 @PreAuthorize가 진짜 방어선이 되도록 유지하세요.
 */
export default function RequireRole({ role, children }) {
  const { user, isLoggedIn, isLoading } = useAuthStore()

  if (isLoading) {
    return null
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // role prop을 단일 문자열로 줬든 배열로 줬든 똑같이 처리
  const allowedRoles = Array.isArray(role) ? role : [role]
  const hasPermission = allowedRoles.includes(user?.role)

  if (!hasPermission) {
    // 권한 부족 시 대시보드로 — 마이페이지 안에서의 권한 차단은 사이드바
    // 메뉴 자체가 안 보이는 게 정상이라, 직접 URL 친 케이스로 가정하고 대시보드로 돌려보냄.
    return <Navigate to="/mypage/dashboard" replace />
  }

  return children
}