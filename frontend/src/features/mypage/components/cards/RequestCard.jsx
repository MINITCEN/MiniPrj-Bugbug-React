import { formatDate, getStatusBadgeClass } from '../../utils/format'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function RequestCard({ request, onWriteReview }) {
  return (
    <ItemCard>
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${request.requestId}`}
          className="text-base font-semibold text-ink hover:text-brand line-clamp-1 flex-1"
        >
          {request.title}
        </a>
        <StatusBadge status={request.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-ink-2">
        <span>등록일 {formatDate(request.createdAt)}</span>
        {request.completedHunterName && (
          <>
            <span aria-hidden="true">·</span>
            <span>완료 헌터: {request.completedHunterName}</span>
          </>
        )}
      </div>

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
