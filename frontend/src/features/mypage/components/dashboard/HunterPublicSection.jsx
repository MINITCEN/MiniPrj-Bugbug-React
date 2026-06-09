/**
 * 헌터 공개 정보 섹션 (HUNTER 전용).
 *
 * 데이터: useMyHunterProfile (GET /api/mypage/hunter/profile)
 *  → grade, completionCount, averageRating, responseCount, gradeStory
 */
import { useMyHunterProfile } from '../../hooks/queries'
import { getGradeImage } from './constants'
import SectionShell from '../SectionShell'
import Button from '../Button'

export default function HunterPublicSection({ onResignHunter }) {
  const { data: profile, isLoading } = useMyHunterProfile()

  if (isLoading || !profile) {
    return (
      <SectionShell>
        <p className="text-sm text-muted">불러오는 중...</p>
      </SectionShell>
    )
  }

  const completionCount = Number(profile.completionCount || 0)
  const averageRating = Number(profile.averageRating || 0)

  return (
    <SectionShell>
      {/* 섹션 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink">공개 정보</h2>
          <p className="mt-1 text-xs text-ink-2">외부에 공개됩니다.</p>
        </div>
        <Button variant="danger" size="sm" onClick={onResignHunter}>
          헌터 자격 해제
        </Button>
      </div>

      {/* 본문: 등급 + 별점 + 활동건수 (3개 카드 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 등급 카드 */}
        <div className="flex items-center gap-4 p-4 rounded-[14px] bg-brand/5 border border-brand/15">
          <img
            src={getGradeImage(profile.grade)}
            alt={`${profile.grade} 등급 훈장`}
            className="w-16 h-16 object-contain shrink-0"
          />
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink">{profile.grade || '루키'}</p>
            <p className="text-xs text-ink-2 mt-0.5">총 {completionCount}건 활동</p>
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
          extra={<span className="text-xs text-ink-2">완료된 의뢰</span>}
        />
      </div>

      {/* 등급 스토리 */}
      {profile.gradeStory && (
        <p className="mt-4 text-xs text-ink-2 leading-relaxed">{profile.gradeStory}</p>
      )}
    </SectionShell>
  )
}

/* ───────────── 보조 컴포넌트 ───────────── */

function StatCard({ label, value, extra }) {
  return (
    <div className="p-4 rounded-[14px] bg-hair/30 border border-hair">
      <p className="text-xs text-ink-2 mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <div className="mt-1">{extra}</div>
    </div>
  )
}

/**
 * 별점을 0~5점 스케일로 별 5개 채워서 표시.
 * 소수점 부분은 반올림으로 처리.
 */
function RatingStars({ rating }) {
  const filled = Math.round(rating)
  return (
    <span className="text-sm text-amber-500" aria-label={`평점 ${rating.toFixed(1)}`}>
      {'★'.repeat(filled)}
      <span className="text-hair-strong">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}
