import { NavLink, Outlet } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'

/**
 * 마이페이지 공통 레이아웃.
 *
 * 구조:
 *   ┌─────────────────────────────────────────┐
 *   │ (Header — shared/layouts에서 처리)       │
 *   ├──────────┬──────────────────────────────┤
 *   │ Sidebar  │  <Outlet />                  │
 *   │ (role별  │  (각 마이페이지 자식 라우트가  │
 *   │  메뉴)    │   여기에 렌더링됨)            │
 *   └──────────┴──────────────────────────────┘
 *   │ (Footer)                                │
 *   └─────────────────────────────────────────┘
 *
 * 사이드바 메뉴는 role(USER / HUNTER)에 따라 달라집니다.
 * - USER: 나의 의뢰 / 나의 리뷰 / 찜한 헌터 + "헌터 등록하기" CTA
 * - HUNTER: 수행 의뢰 / 찜한 의뢰 + "헌터 자격 해제" 버튼
 * - 공통: 내 정보 / 헌터 등급 제도
 */
export default function MyPageLayout() {
  const { user } = useAuthStore()
  const isHunter = user?.role === 'HUNTER'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ───────────── 사이드바 ───────────── */}
        <aside className="md:w-60 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 mb-4">마이페이지</h2>

          <nav className="flex flex-col gap-1">
            {/* 공통 메뉴 */}
            <SideLink to="/mypage/dashboard" mark="i" label="내 정보" />

            {/* USER 전용 메뉴 */}
            {!isHunter && (
              <>
                <SideLink to="/mypage/requests" mark="R" label="나의 의뢰 보기" />
                <SideLink to="/mypage/reviews" mark="V" label="나의 리뷰 관리" />
                <SideLink to="/mypage/bookmarks/hunters" mark="H" label="찜한 헌터" />
              </>
            )}

            {/* HUNTER 전용 메뉴 */}
            {isHunter && (
              <>
                <SideLink to="/mypage/reviews" mark="V" label="나의 리뷰 관리" />
                <SideLink to="/mypage/hunter/tasks" mark="T" label="수행 의뢰" />
                <SideLink to="/mypage/hunter/bookmarks/requests" mark="S" label="찜한 의뢰" />
              </>
            )}
          </nav>

          {/* USER 전용: 헌터 등록 CTA */}
          {!isHunter && (
            <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
              <strong className="block text-sm font-bold text-green-700">
                헌터로 활동하고 싶으신가요?
              </strong>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                헌터로 등록하면 의뢰를 확인하고 보상을 받을 수 있어요.
              </p>
              {/* 모달 트리거는 추후 단계에서 연결 */}
              <button
                type="button"
                className="mt-3 w-full px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                헌터 등록하기
              </button>
            </div>
          )}
        </aside>

        {/* ───────────── 컨텐츠 영역 ───────────── */}
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

/**
 * 사이드바 단일 링크.
 * react-router의 NavLink가 활성 상태(현재 페이지)에 className을 자동으로 부여해줍니다.
 */
function SideLink({ to, mark, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-green-50 text-green-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-50'
        }`
      }
    >
      <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded bg-gray-100">
        {mark}
      </span>
      {label}
    </NavLink>
  )
}