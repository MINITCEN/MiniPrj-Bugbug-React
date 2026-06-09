import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../Modal'
import Button from '../Button'
import { useResignHunter } from '../../hooks/mutations'

export default function HunterResignConfirmModal({ open, onClose }) {
  const { mutate, isPending } = useResignHunter()
  const [errorMsg, setErrorMsg] = useState('')

  const handleResign = () => {
    setErrorMsg('')
    mutate(undefined, {
 
      onError: (err) => {
        const serverMsg =
          err?.response?.data?.message ||
          err?.response?.data ||
          '헌터 자격 해제 중 문제가 발생했습니다.'
        setErrorMsg(typeof serverMsg === 'string' ? serverMsg : '헌터 자격 해제 중 문제가 발생했습니다.')
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="헌터 자격 해제" size="sm">
      <Modal.Body className="space-y-3">
        <p className="text-sm text-ink leading-relaxed">
          헌터 자격을 해제하고 일반 회원으로 전환하시겠습니까?
        </p>

        <div className="p-3 rounded-lg bg-accent/8 border border-accent/15">
          <p className="text-xs text-accent leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="block mb-1">주의사항</strong>
              진행 중인 수행 의뢰가 있다면 자동으로 정리됩니다. 헌터 등급과 활동 기록은
              보존되지만, 다시 헌터로 등록해도 등급은 초기화됩니다.
            </span>
          </p>
        </div>

        {errorMsg && (
          <p className="text-sm text-accent bg-accent/8 border border-accent/15 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" size="md" onClick={onClose} disabled={isPending}>
          취소
        </Button>
        <Button variant="danger" size="md" onClick={handleResign} disabled={isPending}>
          {isPending ? '처리 중...' : '자격 해제'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
