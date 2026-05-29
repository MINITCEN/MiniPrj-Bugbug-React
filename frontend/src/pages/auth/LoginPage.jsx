import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../shared/api/authApi'
import useAuthStore from '../../features/auth/store/useAuthStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { fetchMe } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      await fetchMe()
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
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
          로그인
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              className="px-4 py-3 text-sm rounded-xl border outline-none transition-colors"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--hair-2)')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 py-3.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--ink)' }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--ink-2)' }}>
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-semibold" style={{ color: 'var(--ink)' }}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
