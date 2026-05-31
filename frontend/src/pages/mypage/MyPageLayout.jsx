import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import HunterApplyModal from '../../features/mypage/components/modals/HunterApplyModal'
import HunterGradeInfoModal from '../../features/mypage/components/modals/HunterGradeInfoModal'

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
 * 모달:
 *  - HunterApplyModal: USER만 (사이드바 CTA에서 호출)
 *  - HunterGradeInfoModal: 공용 (사이드바 "헌터 등급 제도" 버튼에서 호출)
 *
 * 사이드바 메뉴는 role(USER / HUNTER)에 따라 달라집니다.
 */
export default function MyPageLayout() {
  const { user } = useAuthStore()
  const isHunter = user?.role === 'HUNTER'

  // 모달 열림 상태 (사이드바에서 직접 트리거하는 두 모달)
  const [applyOpen, setApplyOpen] = useState(false)
  const [gradeOpen, setGradeOpen] = useState(false)

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

            {/* 공통: 헌터 등급 제도 안내 (모달) */}
            <button
              type="button"
              onClick={() => setGradeOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded bg-gray-100">
                G
              </span>
              헌터 등급 제도
            </button>
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
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
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

      {/* 사이드바에서 호출하는 모달들 */}
      <HunterApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
      <HunterGradeInfoModal open={gradeOpen} onClose={() => setGradeOpen(false)} />
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