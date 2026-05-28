import { NavLink } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { logout } from '../api/authApi'

const NAV_LINKS = [
  { label: '서비스 소개', href: '/service-intro', external: true },
  { label: '헌터 찾기', href: '/hunter', external: true },
  { label: '의뢰글', href: '/requestView/list', external: true },
  { label: '모기지수', href: '/mosquito-map', external: false },
]

export default function Header() {
  const { user, isLoggedIn, clearUser } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    clearUser()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* 로고 */}
        <a href="/" className="flex items-center gap-2">
          <img src="/image/favicon.svg" alt="버그버그 로고" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg text-gray-900">버그버그</span>
        </a>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href, external }) =>
            external ? (
              <a
                key={href}
                href={href}
                className="text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                {label}
              </a>
            ) : (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600'}`
                }
              >
                {label}
              </NavLink>
            )
          )}
          {user?.role === 'ADMIN' && (
            <a
              href="/admin/users"
              className="text-sm text-green-600 font-semibold hover:underline"
            >
              관리자 대시보드
            </a>
          )}
        </nav>

        {/* 인증 영역 */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {(user?.role === 'USER' || user?.role === 'HUNTER') && (
                <a href="/mypage" className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                  <img src="/image/mypage_logo.png" alt="마이페이지" className="w-full h-full object-cover" />
                </a>
              )}
              <span className="text-sm text-gray-700 font-medium">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                로그인
              </a>
              <a
                href="/signup"
                className="text-sm px-3 py-1.5 bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                회원가입
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
