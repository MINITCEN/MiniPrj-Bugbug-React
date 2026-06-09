/**
 * 내 의뢰 카드 (RequestListPage에서 사용).
 *
 * 데이터: MyRequestResponseDto
 *   requestId, title, status, createdAt,
 *   completedHunterId, completedHunterName,
 *   reviewId, reviewRating, reviewContent, reviewCreatedAt,
 *   reviewed, reviewable
 *
 * 동작:
 *  - 카드 클릭 → 의뢰 상세 (/requestView/detail/{id}) — 아직 Thymeleaf 페이지라 <a>로 이동
 *  - reviewable === true 일 때만 [리뷰 작성] 버튼 노출
 *  - reviewed === true 일 때 카드 하단에 작성된 리뷰 요약 표시
 */
import { formatDate, getStatusBadgeClass } from '../../utils/format'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function RequestCard({ request, onWriteReview }) {
  return (
    <ItemCard>
      {/* 헤더: 제목 + 상태 배지 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${request.requestId}`}
          className="text-base font-semibold text-ink hover:text-brand line-clamp-1 flex-1"
        >
          {request.title}
        </a>
        <StatusBadge status={request.status} />
      </div>

      {/* 메타: 작성일 + 완료 헌터 */}
      <div className="flex items-center gap-3 text-xs text-ink-2">
        <span>등록일 {formatDate(request.createdAt)}</span>
        {request.completedHunterName && (
          <>
            <span aria-hidden="true">·</span>
            <span>완료 헌터: {request.completedHunterName}</span>
          </>
        )}
      </div>

      {/* 작성된 리뷰가 있으면 요약 표시 */}
      {request.reviewed && (
        <div className="mt-3 p-3 rounded-lg bg-hair/30 border border-hair">
          <div className="flex items-center gap-2 mb-1">
            <RatingStars rating={request.reviewRating ?? 0} />
            <span className="text-xs text-ink-2">
              {formatDate(request.reviewCreatedAt)}
            </span>
          </div>
          <p className="text-sm text-ink leading-relaxed line-clamp-2">{request.reviewContent}</p>
        </div>
      )}

      {/* 리뷰 작성 가능 시 버튼 */}
      {request.reviewable && (
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onWriteReview(request)}>
            리뷰 작성
          </Button>
        </div>
      )}
    </ItemCard>
  )
}

/* ───────────── 보조 ───────────── */

function StatusBadge({ status }) {
  return (
    <span
      className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadgeClass(status)}`}
    >
      {status}
    </span>
  )
}

function RatingStars({ rating }) {
  const filled = Math.round(rating)
  return (
    <span className="text-amber-500 text-sm" aria-label={`평점 ${rating}점`}>
      {'★'.repeat(filled)}
      <span className="text-hair-strong">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}
