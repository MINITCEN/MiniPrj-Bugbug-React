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

export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-green-200 transition-colors">
      {/* 헤더: 의뢰 제목 + 작성일 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${review.requestId}`}
          className="text-base font-semibold text-gray-900 hover:text-green-700 line-clamp-1 flex-1"
        >
          {review.requestTitle}
        </a>
        <span className="shrink-0 text-xs text-gray-400">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* 별점 + 헌터명 */}
      <div className="flex items-center gap-3 mb-3">
        <RatingStars rating={review.rating ?? 0} />
        <span className="text-xs text-gray-500">
          {review.hunterName} 헌터
        </span>
      </div>

      {/* 본문 */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {review.content}
      </p>

      {/* 액션 버튼 (USER만) */}
      {canEdit && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(review)}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </article>
  )
}

function RatingStars({ rating }) {
  const filled = Math.round(rating)
  return (
    <span className="text-amber-500 text-sm" aria-label={`평점 ${rating}점`}>
      {'★'.repeat(filled)}
      <span className="text-gray-200">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}