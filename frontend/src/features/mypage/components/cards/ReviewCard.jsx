/**
 * 리뷰 카드 (ReviewListPage에서 사용).
 *
 * 데이터: ReviewResponseDto
 *   reviewId, requestId, requestTitle, hunterName, userName, rating, content, createdAt
 *
 * 동작:
 *  - USER인 경우 [수정] [삭제] 버튼 노출 (자기가 쓴 리뷰니까)
 *  - HUNTER인 경우 받은 리뷰 조회 — 액션 버튼 없음
 *  - 의뢰 제목 클릭 → 의뢰 상세 (/requestView/detail/{id})
 *
 * canEdit prop으로 액션 노출 여부 제어 (페이지에서 role 보고 전달).
 */
import { formatDate } from '../../utils/format'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  return (
    <ItemCard>
      {/* 헤더: 의뢰 제목 + 작성일 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${review.requestId}`}
          className="text-base font-semibold text-ink hover:text-brand line-clamp-1 flex-1"
        >
          {review.requestTitle}
        </a>
        <span className="shrink-0 text-xs text-muted">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* 별점 + 헌터명 */}
      <div className="flex items-center gap-3 mb-3">
        <RatingStars rating={review.rating ?? 0} />
        <span className="text-xs text-ink-2">
          {review.hunterName} 헌터
        </span>
      </div>

      {/* 본문 */}
      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
        {review.content}
      </p>

      {/* 액션 버튼 (USER만) */}
      {canEdit && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(review)}>
            수정
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(review)}>
            삭제
          </Button>
        </div>
      )}
    </ItemCard>
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
