import { formatDate } from '../../utils/format'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function ReviewCard({ review, canEdit, onEdit, onDelete }) {
  return (
    <ItemCard>
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

      <div className="flex items-center gap-3 mb-3">
        <RatingStars rating={review.rating ?? 0} />
        <span className="text-xs text-ink-2">
          {review.hunterName} 헌터
        </span>
      </div>

      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
        {review.content}
      </p>

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
