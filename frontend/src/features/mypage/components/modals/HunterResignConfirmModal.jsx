/**
 * 헌터 자격 해제 확인 모달.
 *
 * 사용자의 권한이 HUNTER → USER로 변경되는 중요한 액션이라
 * 일반 confirm() 대신 별도 모달로 위험성을 명확히 안내합니다.
 *
 * 해제 후:
 *  - 진행 중인 의뢰는 자동 정리 (백엔드 처리)
 *  - 헌터 등급 / 활동 기록은 보존 (재등록 시 복원되지는 않음)
 *
 * 백엔드: POST /api/mypage/hunter/resign (body 없음)
 */
import { useState } from 'react'
import Modal from '../Modal'
import { DangerButton, GhostButton } from '../Buttons'
import { useResignHunter } from '../../hooks/mutations'

export default function HunterResignConfirmModal({ open, onClose }) {
  const { mutate, isPending } = useResignHunter()
  const [errorMsg, setErrorMsg] = useState('')

  const handleResign = () => {
    setErrorMsg('')
    mutate(undefined, {
      onSuccess: () => {
        onClose()
        alert('헌터 자격이 해제되었습니다.')
        // useResignHunter 내부에서 useAuthStore.fetchMe() 호출 → 사이드바/라우터가 자동 갱신
      },
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
        <p className="text-sm text-gray-700 leading-relaxed">
          헌터 자격을 해제하고 일반 회원으로 전환하시겠습니까?
        </p>

        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs text-red-700 leading-relaxed">
            <strong className="block mb-1">⚠ 주의사항</strong>
            진행 중인 수행 의뢰가 있다면 자동으로 정리됩니다. 헌터 등급과 활동 기록은
            보존되지만, 다시 헌터로 등록해도 등급은 초기화됩니다.
          </p>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <GhostButton onClick={onClose} disabled={isPending}>
          취소
        </GhostButton>
        <DangerButton onClick={handleResign} disabled={isPending}>
          {isPending ? '처리 중...' : '자격 해제'}
        </DangerButton>
      </Modal.Footer>
    </Modal>
  )
}