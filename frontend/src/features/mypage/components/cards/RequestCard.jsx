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

export default function RequestCard({ request, onWriteReview }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-green-200 transition-colors">
      {/* 헤더: 제목 + 상태 배지 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${request.requestId}`}
          className="text-base font-semibold text-gray-900 hover:text-green-700 line-clamp-1 flex-1"
        >
          {request.title}
        </a>
        <StatusBadge status={request.status} />
      </div>

      {/* 메타: 작성일 + 완료 헌터 */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
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
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <RatingStars rating={request.reviewRating ?? 0} />
            <span className="text-xs text-gray-500">
              {formatDate(request.reviewCreatedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{request.reviewContent}</p>
        </div>
      )}

      {/* 리뷰 작성 가능 시 버튼 */}
      {request.reviewable && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onWriteReview(request)}
            className="px-3 py-2 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            리뷰 작성
          </button>
        </div>
      )}
    </article>
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
      <span className="text-gray-200">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}