/**
 * 리뷰 작성/수정 통합 모달.
 *
 * mode prop으로 두 가지 모드 지원:
 *  - 'create': 의뢰에 대해 새 리뷰 작성. request 객체 필요.
 *  - 'update': 기존 리뷰 수정. review 객체 필요.
 *
 * 백엔드 DTO:
 *   - 작성: ReviewCreateRequestDto { requestId, hunterId, rating, reviewContent }
 *   - 수정: ReviewUpdateRequestDto { rating, reviewContent }
 *
 * Props:
 *   - open, onClose
 *   - mode: 'create' | 'update'
 *   - request: (create 모드) MyRequestResponseDto
 *   - review:  (update 모드) ReviewResponseDto
 */
import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { PrimaryButton, GhostButton } from '../Buttons'
import { useCreateReview, useUpdateReview } from '../../hooks/mutations'

export default function ReviewFormModal({ open, onClose, mode = 'create', request, review }) {
  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const isCreate = mode === 'create'
  const isPending = isCreate ? createMutation.isPending : updateMutation.isPending

  // 모달 열릴 때마다 초기값 설정
  useEffect(() => {
    if (!open) return
    if (isCreate) {
      setRating(5)
      setContent('')
    } else if (review) {
      setRating(review.rating ?? 5)
      // 백엔드 ReviewResponseDto의 필드명은 `content` (MyRequestResponseDto의 reviewContent와는 다름)
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

  // 표시용 상단 의뢰/헌터 정보
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
          {/* 어떤 의뢰/헌터에 대한 리뷰인지 안내 */}
          {(headerInfo.title || headerInfo.subtitle) && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              {headerInfo.title && (
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {headerInfo.title}
                </p>
              )}
              {headerInfo.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{headerInfo.subtitle}</p>
              )}
            </div>
          )}

          {/* 별점 선택 */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">평점</label>
            <RatingPicker value={rating} onChange={setRating} />
          </div>

          {/* 본문 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              리뷰 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="헌터의 활동은 어떠셨나요?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                         focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none
                         transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <GhostButton onClick={onClose} disabled={isPending}>취소</GhostButton>
          <PrimaryButton type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : isCreate ? '작성하기' : '수정하기'}
          </PrimaryButton>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

/* ───────────── 보조 ───────────── */

/** 클릭으로 1~5 별점을 선택할 수 있는 컴포넌트 */
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
            n <= value ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{value}점</span>
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