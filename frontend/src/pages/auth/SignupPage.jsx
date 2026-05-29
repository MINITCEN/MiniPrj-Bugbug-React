import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, checkEmail, checkNickname } from '../../shared/api/authApi'

const INIT_CHECK = { checked: false, available: false, message: '' }

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    phoneNumber: '',
    isPrivacyAgreed: false,
  })
  const [emailCheck, setEmailCheck] = useState(INIT_CHECK)
  const [nicknameCheck, setNicknameCheck] = useState(INIT_CHECK)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'email') setEmailCheck(INIT_CHECK)
    if (name === 'nickname') setNicknameCheck(INIT_CHECK)
    setError('')
  }

  const handleCheckEmail = async () => {
    if (!form.email) return
    try {
      const { available } = await checkEmail(form.email)
      setEmailCheck({
        checked: true,
        available,
        message: available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.',
      })
    } catch {
      setEmailCheck({ checked: true, available: false, message: '확인 중 오류가 발생했습니다.' })
    }
  }

  const handleCheckNickname = async () => {
    if (!form.nickname) return
    try {
      const { available } = await checkNickname(form.nickname)
      setNicknameCheck({
        checked: true,
        available,
        message: available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.',
      })
    } catch {
      setNicknameCheck({ checked: true, available: false, message: '확인 중 오류가 발생했습니다.' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!emailCheck.checked || !emailCheck.available) {
      setError('이메일 중복 확인을 완료해 주세요.')
      return
    }
    if (!nicknameCheck.checked || !nicknameCheck.available) {
      setError('닉네임 중복 확인을 완료해 주세요.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!form.isPrivacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해 주세요.')
      return
    }

    setIsLoading(true)
    try {
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        phoneNumber: form.phoneNumber || null,
        address: null,
        isPrivacyAgreed: true,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div
        className="w-full max-w-md p-10"
        style={{
          background: '#fff',
          borderRadius: 20,
          border: '1px solid var(--hair-2)',
          boxShadow: '0 2px 24px -8px rgba(29,58,46,.08)',
        }}
      >
        <h1
          className="text-2xl font-bold tracking-tight mb-8"
          style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
        >
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p
              className="text-sm px-4 py-3 rounded-xl"
              style={{ color: 'var(--accent)', background: 'rgba(229,87,58,.08)' }}
            >
              {error}
            </p>
          )}

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              이메일 <Required />
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="flex-1 px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
                style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
              />
              <CheckButton onClick={handleCheckEmail} />
            </div>
            <CheckResult {...emailCheck} />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              비밀번호 <Required />
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력하세요"
              className="px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              비밀번호 확인 <Required />
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
              className="px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
            />
            {form.passwordConfirm && form.password !== form.passwordConfirm && (
              <p className="text-xs" style={{ color: 'var(--accent)' }}>
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              닉네임 <Required />
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                required
                placeholder="닉네임을 입력하세요"
                className="flex-1 px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
                style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
              />
              <CheckButton onClick={handleCheckNickname} />
            </div>
            <CheckResult {...nicknameCheck} />
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              전화번호
              <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--muted)' }}>선택</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
            />
          </div>

          {/* 개인정보 동의 */}
          <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              name="isPrivacyAgreed"
              checked={form.isPrivacyAgreed}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-[var(--ink)]"
            />
            <span className="text-sm" style={{ color: 'var(--ink-2)' }}>
              개인정보 수집 및 이용에 동의합니다. <Required />
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 py-3.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--ink)' }}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-2)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--ink)' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

function Required() {
  return <span style={{ color: 'var(--accent)' }}>*</span>
}

function CheckButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 px-4 py-3 text-sm font-medium rounded-xl border transition-colors hover:bg-gray-50"
      style={{ borderColor: 'var(--hair-2)', color: 'var(--ink-2)' }}
    >
      중복 확인
    </button>
  )
}

function CheckResult({ checked, available, message }) {
  if (!checked) return null
  return (
    <p className="text-xs" style={{ color: available ? 'var(--brand-2)' : 'var(--accent)' }}>
      {message}
    </p>
  )
}