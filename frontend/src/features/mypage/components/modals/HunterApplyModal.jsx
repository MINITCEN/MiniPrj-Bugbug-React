import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import Modal from '../Modal'
import Button from '../Button'
import { useApplyForHunter } from '../../hooks/mutations'

export default function HunterApplyModal({ open, onClose }) {
  const { mutate, isPending } = useApplyForHunter()
  const [pledged, setPledged] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open) {
      setPledged(false)
      setErrorMsg('')
    }
  }, [open])

  const handleApply = () => {
    if (!pledged) return  
    setErrorMsg('')

    mutate(
      { pledgeAgreed: true },
      {
        onSuccess: () => {
          onClose()
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
        <p className="text-sm text-ink leading-relaxed">
          헌터로 등록하면 다음과 같은 활동이 가능해집니다:
        </p>

        <ul className="space-y-2 text-sm text-ink pl-4">
          <ListItem>의뢰 목록 조회 및 수행 의뢰 신청</ListItem>
          <ListItem>활동 실적에 따른 헌터 등급 부여</ListItem>
          <ListItem>완료된 의뢰에 대한 보상 수령</ListItem>
        </ul>

        {/* 서약 동의 박스 */}
        <div className="mt-4 p-4 rounded-[14px] bg-hair/30 border border-hair">
          <p className="text-xs text-ink-2 leading-relaxed mb-3">
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
              className="mt-0.5 w-4 h-4 accent-brand cursor-pointer"
            />
            <span className="text-sm text-ink font-medium">
              위 내용에 동의하며 헌터 활동을 시작하겠습니다.
            </span>
          </label>
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
        <Button
          variant="primary"
          size="md"
          onClick={handleApply}
          disabled={!pledged || isPending}
        >
          {isPending ? '처리 중...' : '신청하기'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ListItem({ children }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 mt-0.5 text-brand shrink-0" aria-hidden="true" />
      <span className="flex-1">{children}</span>
    </li>
  )
}
