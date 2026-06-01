/**
 * 리뷰 삭제 확인 모달.
 */
import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { DangerButton, GhostButton } from '../Buttons'
import { useDeleteReview } from '../../hooks/mutations'

export default function ReviewDeleteConfirmModal({ open, onClose, review }) {
  const { mutate, isPending } = useDeleteReview()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open) setErrorMsg('')
  }, [open])

  const handleDelete = () => {
    if (!review?.reviewId) return
    setErrorMsg('')
    mutate(review.reviewId, {
      onSuccess: () => onClose(),
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          '리뷰 삭제에 실패했습니다.'
        setErrorMsg(typeof msg === 'string' ? msg : '리뷰 삭제에 실패했습니다.')
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="리뷰 삭제" size="sm">
      <Modal.Body>
        <p className="text-sm text-gray-700 leading-relaxed">
          이 리뷰를 삭제하시겠습니까?
        </p>
        {review?.requestTitle && (
          <p className="mt-2 text-xs text-gray-500">
            의뢰: <strong className="text-gray-700">{review.requestTitle}</strong>
          </p>
        )}
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs text-red-700">
            삭제한 리뷰는 복구할 수 없습니다.
          </p>
        </div>
        {errorMsg && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <GhostButton onClick={onClose} disabled={isPending}>취소</GhostButton>
        <DangerButton onClick={handleDelete} disabled={isPending}>
          {isPending ? '삭제 중...' : '삭제'}
        </DangerButton>
      </Modal.Footer>
    </Modal>
  )
}