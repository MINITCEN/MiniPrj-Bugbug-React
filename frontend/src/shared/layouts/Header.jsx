import { Link, NavLink } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { logout } from '../api/authApi'

const NAV_LINKS = [
  { label: '서비스 소개', to: '/service-intro' },
  { label: '헌터 찾기', to: '/hunter' },
  { label: '의뢰 게시판', to: '/requestView/list' },
  { label: '모기지수', to: '/mosquito-map' },
]

export default function Header() {
  const { user, isLoggedIn, clearUser } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    clearUser()
    window.location.href = '/'
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        borderBottom: '1px solid var(--hair-2)',
        background: 'rgba(251,250,246,.75)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-20 h-16 flex items-center gap-14">

        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/image/favicon.svg" alt="버그버그 로고" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}>버그버그</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-[15px] font-medium transition-colors ${isActive ? 'text-gray-900' : ''}`
              }
              style={({ isActive }) => ({ color: isActive ? 'var(--ink)' : 'var(--ink-2)' })}
            >
              {label}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/users"
              className="text-[15px] font-semibold transition-colors"
              style={({ isActive }) => ({ color: isActive ? '#1a7a55' : 'var(--brand-2)' })}
            >
              관리자 대시보드
            </NavLink>
          )}
        </nav>

        {/* 인증 영역 */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {isLoggedIn ? (
            <>
              {(user?.role === 'USER' || user?.role === 'HUNTER') && (
                <Link to="/mypage" className="w-9 h-9 rounded-full overflow-hidden border" style={{ borderColor: 'var(--hair-2)' }}>
                  <img src="/image/mypage_logo.png" alt={user?.nickname} className="w-full h-full object-cover" />
                </Link>
              )}
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-1.5 border rounded-full transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--hair)', color: 'var(--ink-2)' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--ink-2)' }}
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white px-[18px] py-2 transition-opacity hover:opacity-90"
                style={{ background: 'var(--ink)', borderRadius: '999px' }}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
