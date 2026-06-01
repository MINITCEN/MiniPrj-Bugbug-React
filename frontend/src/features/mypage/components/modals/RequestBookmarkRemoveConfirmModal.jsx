/**
 * 의뢰 찜 해제 확인 모달.
 *
 * BookmarkRemoveConfirmModal(헌터 찜 해제)과 거의 동일한 구조이지만,
 * 대상이 다르고(헌터 vs 의뢰) 사용하는 mutation이 달라 별도 컴포넌트.
 * 두 모달 모두 5분 이내 작성 가능한 단순 확인 모달이라 통합보단 분리가 명확.
 */
import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { DangerButton, GhostButton } from '../Buttons'
import { useToggleSavedRequest } from '../../hooks/mutations'

export default function RequestBookmarkRemoveConfirmModal({ open, onClose, request }) {
  const { mutate, isPending } = useToggleSavedRequest()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open) setErrorMsg('')
  }, [open])

  const handleRemove = () => {
    if (!request?.requestId) return
    setErrorMsg('')
    mutate(request.requestId, {
      onSuccess: () => onClose(),
      onError: (err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data ||
          '찜 해제에 실패했습니다.'
        setErrorMsg(typeof msg === 'string' ? msg : '찜 해제에 실패했습니다.')
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="찜 해제" size="sm">
      <Modal.Body>
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900 line-clamp-1">
            {request?.title ?? ''}
          </strong>
          {' '}의뢰를 찜 목록에서 제거하시겠습니까?
        </p>
        {errorMsg && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <GhostButton onClick={onClose} disabled={isPending}>취소</GhostButton>
        <DangerButton onClick={handleRemove} disabled={isPending}>
          {isPending ? '처리 중...' : '찜 해제'}
        </DangerButton>
      </Modal.Footer>
    </Modal>
  )
}