import { useState, useEffect } from 'react'
import Modal from '../Modal'
import Button from '../Button'
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
        <p className="text-sm text-ink">
          <strong className="text-ink">{hunter?.hunterName ?? ''} 헌터</strong>를(을){' '}
          찜 목록에서 제거하시겠습니까?
        </p>
        {errorMsg && (
          <p className="mt-3 text-sm text-accent bg-accent/8 border border-accent/15 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" size="md" onClick={onClose} disabled={isPending}>취소</Button>
        <Button variant="danger" size="md" onClick={handleRemove} disabled={isPending}>
          {isPending ? '처리 중...' : '찜 해제'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
