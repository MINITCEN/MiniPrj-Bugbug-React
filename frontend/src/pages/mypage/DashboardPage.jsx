/**
 * 대시보드 페이지 (마이페이지 메인 화면).
 * 경로: /mypage/dashboard
 * 권한: USER + HUNTER
 *
 * 구성:
 *   1. MyInfoSection         — 내 정보 카드 (공용)
 *   2. HunterPublicSection   — 헌터 공개 정보 (HUNTER만)
 *   3. ActivitySection       — 활동 요약 (role별로 다름)
 *      - USER:   최근 의뢰 + 찜한 헌터
 *      - HUNTER: 리뷰 요약 + 최근 활동 + 찜한 의뢰
 *   4. MoreServicesSection   — 기타 서비스 바로가기 (공용)
 *
 * 모달 트리거(개인정보 변경 / 헌터 자격 해제)는 일단 stub.
 * 실제 모달 컴포넌트는 7단계에서 작성하여 여기와 연결됩니다.
 */
import useAuthStore from '../../features/auth/store/useAuthStore'

import MyInfoSection from '../../features/mypage/components/dashboard/MyInfoSection'
import HunterPublicSection from '../../features/mypage/components/dashboard/HunterPublicSection'
import UserActivitySection from '../../features/mypage/components/dashboard/UserActivitySection'
import HunterActivitySection from '../../features/mypage/components/dashboard/HunterActivitySection'
import HunterSavedRequestsSection from '../../features/mypage/components/dashboard/HunterSavedRequestsSection'
import MoreServicesSection from '../../features/mypage/components/dashboard/MoreServicesSection'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isHunter = user?.role === 'HUNTER'

  // === 7단계에서 실제 모달과 연결될 stub 핸들러들 ===
  const handleOpenProfileModal = () => {
    // TODO(7단계): ProfileModal 열기
    alert('개인정보 변경 모달은 다음 단계에서 구현됩니다.')
  }
  const handleResignHunter = () => {
    // TODO(7단계): 확인 모달 + useResignHunter mutation
    alert('헌터 자격 해제는 다음 단계에서 구현됩니다.')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 내 정보 (항상 표시) */}
      <MyInfoSection onOpenProfileModal={handleOpenProfileModal} />

      {/* 2. 헌터 공개 정보 (HUNTER만) */}
      {isHunter && <HunterPublicSection onResignHunter={handleResignHunter} />}

      {/* 3. 활동 요약 (role별 분기) */}
      {!isHunter ? (
        <UserActivitySection />
      ) : (
        <div className="flex flex-col gap-4">
          <HunterActivitySection />
          <HunterSavedRequestsSection />
        </div>
      )}

      {/* 4. 더보기 (항상 표시) */}
      <MoreServicesSection />

      {/* 보안 안내 배너 */}
      <div className="rounded-2xl bg-green-50 border border-green-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong className="text-green-700">버그버그는 안전하고 신뢰할 수 있는 서비스를 제공합니다.</strong>
          <br className="sm:hidden" /> 개인정보는 설정된 보호 범위 안에서만 사용됩니다.
        </p>
        <button
          type="button"
          className="shrink-0 px-3 py-2 text-xs font-semibold text-green-700 border border-green-200 bg-white rounded-lg hover:bg-green-50 transition-colors"
        >
          개인정보 처리방침 보기
        </button>
      </div>
    </div>
  )
}