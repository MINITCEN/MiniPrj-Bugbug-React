/**
 * 헌터 공개 정보 섹션 (HUNTER 전용).
 *
 * 데이터: useMyHunterProfile (GET /api/mypage/hunter/profile)
 *  → grade, completionCount, averageRating, responseCount, gradeStory
 *
 * "헌터 자격 해제" 버튼은 7단계에서 확인 모달과 연결 예정.
 */
import { useMyHunterProfile } from '../../hooks/queries'
import { getGradeImage } from './constants'

export default function HunterPublicSection({ onResignHunter }) {
  const { data: profile, isLoading } = useMyHunterProfile()

  if (isLoading || !profile) {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </section>
    )
  }

  const completionCount = Number(profile.completionCount || 0)
  const averageRating = Number(profile.averageRating || 0)

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* 섹션 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">공개 정보</h2>
          <p className="mt-1 text-xs text-gray-500">외부에 공개됩니다.</p>
        </div>
        <button
          type="button"
          onClick={onResignHunter}
          className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          헌터 자격 해제
        </button>
      </div>

      {/* 본문: 등급 + 별점 + 활동건수 (3개 카드 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 등급 카드 */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <img
            src={getGradeImage(profile.grade)}
            alt={`${profile.grade} 등급 훈장`}
            className="w-16 h-16 object-contain shrink-0"
          />
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900">{profile.grade || '루키'}</p>
            <p className="text-xs text-gray-500 mt-0.5">총 {completionCount}건 활동</p>
          </div>
        </div>

        {/* 평점 카드 */}
        <StatCard
          label="리뷰 평점"
          value={averageRating.toFixed(1)}
          extra={<RatingStars rating={averageRating} />}
        />

        {/* 활동 건수 카드 */}
        <StatCard
          label="활동 건수"
          value={`${completionCount}건`}
          extra={<span className="text-xs text-gray-500">완료된 의뢰</span>}
        />
      </div>

      {/* 등급 스토리 */}
      {profile.gradeStory && (
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">{profile.gradeStory}</p>
      )}
    </section>
  )
}

/* ───────────── 보조 컴포넌트 ───────────── */

function StatCard({ label, value, extra }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-1">{extra}</div>
    </div>
  )
}

/**
 * 별점을 0~5점 스케일로 별 5개 채워서 표시.
 * 소수점 부분은 일단 반올림으로 처리 (반쪽 별 표현은 추후 디테일).
 */
function RatingStars({ rating }) {
  const filled = Math.round(rating)
  return (
    <span className="text-sm text-amber-500" aria-label={`평점 ${rating.toFixed(1)}`}>
      {'★'.repeat(filled)}
      <span className="text-gray-200">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}