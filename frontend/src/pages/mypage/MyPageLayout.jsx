import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  UserRound,
  ClipboardList,
  MessageSquareText,
  Heart,
  Briefcase,
  Bookmark,
  Award,
} from 'lucide-react'
import useAuthStore from '../../features/auth/store/useAuthStore'
import Button from '../../features/mypage/components/Button'
import HunterApplyModal from '../../features/mypage/components/modals/HunterApplyModal'
import HunterGradeInfoModal from '../../features/mypage/components/modals/HunterGradeInfoModal'

export default function MyPageLayout() {
  const { user } = useAuthStore()
  const isHunter = user?.role === 'HUNTER'

  const [applyOpen, setApplyOpen] = useState(false)
  const [gradeOpen, setGradeOpen] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ───────────── 사이드바 ───────────── */}
        <aside className="md:w-60 shrink-0 md:sticky md:top-20">
          <h2 className="text-lg font-bold text-ink mb-4">마이페이지</h2>

          <nav className="flex flex-col gap-1">
            {/* 공통 메뉴 */}
            <SideLink to="/mypage/dashboard" icon={UserRound} label="내 정보" />

            {/* USER 전용 메뉴 */}
            {!isHunter && (
              <>
                <SideLink to="/mypage/requests" icon={ClipboardList} label="나의 의뢰 보기" />
                <SideLink to="/mypage/reviews" icon={MessageSquareText} label="나의 리뷰 관리" />
                <SideLink to="/mypage/bookmarks/hunters" icon={Heart} label="찜한 헌터" />
              </>
            )}

            {/* HUNTER 전용 메뉴 */}
            {isHunter && (
              <>
                <SideLink to="/mypage/reviews" icon={MessageSquareText} label="내게 온 리뷰" />
                <SideLink to="/mypage/hunter/tasks" icon={Briefcase} label="수행 의뢰" />
                <SideLink to="/mypage/hunter/bookmarks/requests" icon={Bookmark} label="찜한 의뢰" />
              </>
            )}

            {/* 라우트 이동 메뉴와 모달 트리거를 시각적으로 분리 */}
            <div className="my-2 border-t border-hair" aria-hidden="true" />

            {/* 공통: 헌터 등급 제도 안내 (모달) */}
            <button
              type="button"
              onClick={() => setGradeOpen(true)}
              className="flex items-center gap-2 pl-3 pr-3 py-2 rounded-r-lg text-sm text-ink-2 hover:bg-hair/40 transition-colors text-left border-l-2 border-transparent"
            >
              <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
              헌터 등급 제도
            </button>
          </nav>

          {/* USER 전용: 헌터 등록 CTA */}
          {!isHunter && (
            <div className="mt-6 p-4 rounded-[14px] bg-brand/5 border border-brand/15">
              <strong className="block text-sm font-bold text-brand">
                헌터로 활동하고 싶으신가요?
              </strong>
              <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                헌터로 등록하면 의뢰를 확인하고 보상을 받을 수 있어요.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setApplyOpen(true)}
                className="mt-3 w-full"
              >
                헌터 등록하기
              </Button>
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
 *
 * 활성 표현: 좌측 2px brand 수직바 + bold text-ink.
 * 비활성: text-ink-2 + hover 시 hair/40 배경.
 * react-router의 NavLink가 활성 상태를 자동 부여.
 */
function SideLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 pl-3 pr-3 py-2 rounded-r-lg text-sm transition-colors border-l-2 ${
          isActive
            ? 'border-brand bg-brand/5 text-ink font-semibold'
            : 'border-transparent text-ink-2 hover:bg-hair/40'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {label}
    </NavLink>
  )
}
