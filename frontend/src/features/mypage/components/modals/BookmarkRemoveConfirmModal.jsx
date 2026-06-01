/**
 * 헌터 찜 해제 확인 모달.
 *
 * 단순 confirm()을 모달로 대체. 헌터 이름을 명시해서
 * 실수로 다른 헌터를 해제하는 일을 줄임.
 *
 * 백엔드: POST /api/hunters/{hunterId}/bookmarks (토글)
 */
import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { DangerButton, GhostButton } from '../Buttons'
import { useToggleSavedHunter } from '../../hooks/mutations'

export default function BookmarkRemoveConfirmModal({ open, onClose, hunter }) {
  const { mutate, isPending } = useToggleSavedHunter()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open) setErrorMsg('')
  }, [open])

  const handleRemove = () => {
    if (!hunter?.hunterId) return
    setErrorMsg('')
    mutate(hunter.hunterId, {
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
          <strong className="text-gray-900">{hunter?.hunterName ?? ''} 헌터</strong>를(을){' '}
          찜 목록에서 제거하시겠습니까?
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