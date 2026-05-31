/**
 * 헌터 등록 신청 모달.
 *
 * 기존 dashboard.js의 applyHunter()는 confirm() 한 번으로 끝났지만,
 * 실제 헌터 활동을 시작한다는 중요한 액션이라 다음 정보를 제공:
 *   - 헌터로 활동하면 어떤 권한이 생기는지
 *   - 활동 시 책임 (서약)
 *
 * 사용자가 서약에 동의(체크박스)해야 [신청] 버튼 활성화.
 *
 * 백엔드 DTO: HunterApplyRequestDto { pledgeAgreed: Boolean }
 */
import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { PrimaryButton, GhostButton } from '../Buttons'
import { useApplyForHunter } from '../../hooks/mutations'

export default function HunterApplyModal({ open, onClose }) {
  const { mutate, isPending } = useApplyForHunter()
  const [pledged, setPledged] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 모달 열릴 때마다 상태 초기화
  useEffect(() => {
    if (open) {
      setPledged(false)
      setErrorMsg('')
    }
  }, [open])

  const handleApply = () => {
    if (!pledged) return  // 동의 안 했으면 진행 안 함 (이중 안전장치)
    setErrorMsg('')

    mutate(
      { pledgeAgreed: true },
      {
        onSuccess: () => {
          onClose()
          // 성공 알림은 일단 alert로 (토스트 시스템은 향후 도입)
          alert('헌터 신청이 접수되었습니다.')
        },
        onError: (err) => {
          const serverMsg =
            err?.response?.data?.message ||
            err?.response?.data ||
            '헌터 신청 처리 중 문제가 발생했습니다.'
          setErrorMsg(typeof serverMsg === 'string' ? serverMsg : '헌터 신청 처리 중 문제가 발생했습니다.')
        },
      }
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="헌터 등록 신청" size="md">
      <Modal.Body className="space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          헌터로 등록하면 다음과 같은 활동이 가능해집니다:
        </p>

        <ul className="space-y-2 text-sm text-gray-700 pl-4">
          <ListItem>의뢰 목록 조회 및 수행 의뢰 신청</ListItem>
          <ListItem>활동 실적에 따른 헌터 등급 부여</ListItem>
          <ListItem>완료된 의뢰에 대한 보상 수령</ListItem>
        </ul>

        {/* 서약 동의 박스 */}
        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            저는 버그버그 헌터로서 다음을 서약합니다:
            <br />
            의뢰자의 요청을 성실하게 수행하고, 활동 중 알게 된 개인정보를 안전하게 보호하며,
            서비스 운영 정책을 준수하겠습니다.
          </p>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pledged}
              onChange={(e) => setPledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded
                         focus:ring-green-500 cursor-pointer"
            />
            <span className="text-sm text-gray-900 font-medium">
              위 내용에 동의하며 헌터 활동을 시작하겠습니다.
            </span>
          </label>
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
        <PrimaryButton
          onClick={handleApply}
          disabled={!pledged || isPending}
        >
          {isPending ? '처리 중...' : '신청하기'}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  )
}

function ListItem({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-green-600 mt-0.5">✓</span>
      <span className="flex-1">{children}</span>
    </li>
  )
}