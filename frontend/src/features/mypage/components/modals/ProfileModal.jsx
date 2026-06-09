import { useEffect, useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import { useMyInfo } from '../../hooks/queries'
import { useUpdateMyInfo } from '../../hooks/mutations'

export default function ProfileModal({ open, onClose }) {
  const { data: myInfo } = useMyInfo()
  const { mutate, isPending } = useUpdateMyInfo()

  const [form, setForm] = useState({ nickname: '', phoneNumber: '', address: '' })
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open && myInfo) {
      setForm({
        nickname: myInfo.nickname ?? '',
        phoneNumber: myInfo.phoneNumber ?? '',
        address: myInfo.address === '등록된 주소가 없습니다.' ? '' : (myInfo.address ?? ''),
      })
      setErrorMsg('')
    }
  }, [open, myInfo])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!form.nickname.trim()) {
      setErrorMsg('닉네임을 입력해주세요.')
      return
    }

    const payload = {
      nickname: form.nickname.trim(),
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
    }

    mutate(payload, {
      onSuccess: () => {
        onClose()
      },
      onError: (err) => {
        const serverMsg =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          '개인정보 변경에 실패했습니다.'
        setErrorMsg(typeof serverMsg === 'string' ? serverMsg : '개인정보 변경에 실패했습니다.')
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="개인정보 변경" size="md">
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Field
            label="닉네임"
            required
            value={form.nickname}
            onChange={handleChange('nickname')}
            placeholder="닉네임을 입력하세요"
          />
          <Field
            label="연락처"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            placeholder="010-1234-5678"
          />
          <Field
            label="주소"
            value={form.address}
            onChange={handleChange('address')}
            placeholder="활동 지역의 주소를 입력하세요"
          />

          <div>
            <label className="block text-xs text-ink-2 mb-1">이메일</label>
            <div className="px-3 py-2 text-sm text-ink-2 bg-hair/30 border border-hair rounded-lg">
              {myInfo?.email}
              <span className="ml-2 text-[10px] text-muted">(변경 불가)</span>
            </div>
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
          <Button variant="primary" size="md" type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

function Field({ label, required, ...inputProps }) {
  return (
    <div>
      <label className="block text-xs text-ink-2 mb-1">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 text-sm border border-hair rounded-lg transition-colors"
        {...inputProps}
      />
    </div>
  )
}