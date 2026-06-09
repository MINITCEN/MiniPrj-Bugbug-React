import { useEffect, useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import { useCreateReview, useUpdateReview } from '../../hooks/mutations'

export default function ReviewFormModal({ open, onClose, mode = 'create', request, review }) {
  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const isCreate = mode === 'create'
  const isPending = isCreate ? createMutation.isPending : updateMutation.isPending

  useEffect(() => {
    if (!open) return
    if (isCreate) {
      setRating(5)
      setContent('')
    } else if (review) {
      setRating(review.rating ?? 5)
      setContent(review.content ?? review.reviewContent ?? '')
    }
    setErrorMsg('')
  }, [open, isCreate, review])

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!content.trim()) {
      setErrorMsg('리뷰 내용을 입력해주세요.')
      return
    }

    if (isCreate) {
      if (!request?.requestId || !request?.completedHunterId) {
        setErrorMsg('리뷰 작성에 필요한 정보가 부족합니다.')
        return
      }
      createMutation.mutate(
        {
          requestId: request.requestId,
          hunterId: request.completedHunterId,
          rating,
          reviewContent: content.trim(),
        },
        {
          onSuccess: () => onClose(),
          onError: (err) => setErrorMsg(extractErrorMsg(err, '리뷰 작성에 실패했습니다.')),
        }
      )
    } else {
      updateMutation.mutate(
        {
          reviewId: review.reviewId,
          body: { rating, reviewContent: content.trim() },
        },
        {
          onSuccess: () => onClose(),
          onError: (err) => setErrorMsg(extractErrorMsg(err, '리뷰 수정에 실패했습니다.')),
        }
      )
    }
  }

  const headerInfo = isCreate
    ? { title: request?.title, subtitle: request?.completedHunterName && `${request.completedHunterName} 헌터` }
    : { title: review?.requestTitle, subtitle: review?.hunterName && `${review.hunterName} 헌터` }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? '리뷰 작성' : '리뷰 수정'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          {(headerInfo.title || headerInfo.subtitle) && (
            <div className="p-3 rounded-lg bg-hair/30 border border-hair">
              {headerInfo.title && (
                <p className="text-sm font-semibold text-ink line-clamp-1">
                  {headerInfo.title}
                </p>
              )}
              {headerInfo.subtitle && (
                <p className="text-xs text-ink-2 mt-0.5">{headerInfo.subtitle}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-ink-2 mb-2">평점</label>
            <RatingPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-xs text-ink-2 mb-1">
              리뷰 내용 <span className="text-accent">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="헌터의 활동은 어떠셨나요?"
              className="w-full px-3 py-2 text-sm border border-hair rounded-lg transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-accent bg-accent/8 border border-accent/15 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isPending}>취소</Button>
          <Button variant="primary" size="md" type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : isCreate ? '작성하기' : '수정하기'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}


function RatingPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="평점 선택">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}점`}
          className={`text-2xl transition-colors ${
            n <= value ? 'text-amber-400' : 'text-hair-strong hover:text-amber-200'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-ink-2">{value}점</span>
    </div>
  )
}

function extractErrorMsg(err, fallback) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data ||
    err?.message ||
    fallback
  return typeof msg === 'string' ? msg : fallback
}