import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchUsers, suspendUser } from '../../features/admin/api/adminApi'
import { logout } from '../../shared/api/authApi'

export default function AdminUsersPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(0)
  const [role, setRole] = useState('')
  const [tempRole, setTempRole] = useState('')

  // 1. 관리자 권한 가드
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn || user?.role !== 'ADMIN') {
        alert('권한이 없습니다.')
        navigate('/')
      }
    }
  }, [isAuthLoading, isLoggedIn, user, navigate])

  // 2. React Query를 통한 회원 목록 패치
  const { data, isLoading: isDataLoading, isError, error } = useQuery({
    queryKey: ['adminUsers', page, role],
    queryFn: () => fetchUsers(page, 10, role),
    keepPreviousData: true,
    enabled: isLoggedIn && user?.role === 'ADMIN',
  })

  // 3. 계정 정지 Mutation
  const suspendMutation = useMutation({
    mutationFn: ({ userId, days }) => suspendUser(userId, days),
    onSuccess: (res, variables) => {
      const msg = variables.days === -1 ? '영구 정지' : '7일 정지'
      alert(`유저가 성공적으로 ${msg} 처리되었습니다.`)
      queryClient.invalidateQueries(['adminUsers'])
    },
    onError: (err) => {
      alert(err.response?.data?.message || '정지 처리 중 오류가 발생했습니다.')
    }
  })

  const handleSuspend = (userId, days) => {
    const msg = days === -1 ? '영구 정지' : '7일 정지'
    if (window.confirm(`해당 유저를 정말로 ${msg} 처리하시겠습니까?`)) {
      suspendMutation.mutate({ userId, days })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      clearUser()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = () => {
    setPage(0)
    setRole(tempRole)
  }

  if (isAuthLoading || !isLoggedIn || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-2) transparent var(--brand-2) transparent' }} />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 700px 500px at 85% 15%, rgba(46,140,104,.06), transparent 60%),
          radial-gradient(ellipse 500px 400px at 15% 75%, rgba(229,87,58,.04), transparent 60%),
          #fbfaf6
        `,
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        
        {/* 좌측 사이드바 카테고리 (기존 디자인을 한 차원 높인 프리미엄 디자인) */}
        <aside
          className="flex flex-col gap-1.5 p-6 h-fit sticky top-24"
          style={{
            background: '#fff',
            border: '1px solid var(--hair-2)',
            borderRadius: 20,
            boxShadow: '0 2px 24px -8px rgba(29,58,46,.04)',
          }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4 px-3" style={{ color: 'var(--muted)' }}>
            관리자 대시보드
          </h2>
          
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: 'rgba(46,140,104,.08)',
              color: 'var(--brand-2)',
            }}
          >
            <span className="text-base">👤</span> 전체 회원 관리
          </Link>
          
          <Link
            to="/admin/applications"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all hover:bg-gray-50"
            style={{ color: 'var(--ink-2)' }}
          >
            <span className="text-base">🛡️</span> 헌터 승인 관리
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all hover:bg-red-50 text-left mt-6 w-full"
            style={{ color: '#dc3545' }}
          >
            <span className="text-base">🔑</span> 로그아웃
          </button>
        </aside>

        {/* 우측 메인 콘텐츠 영역 */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
              전체 회원 관리
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
              서비스에 가입된 모든 일반 유저와 헌터를 조회하고 계정 상태를 제어합니다.
            </p>
          </div>

          {/* 검색 필터 구역 */}
          <div
            className="flex flex-wrap items-center gap-3 p-4"
            style={{
              background: '#fff',
              border: '1px solid var(--hair-2)',
              borderRadius: 16,
              boxShadow: '0 1px 0 rgba(255,255,255,.6) inset',
            }}
          >
            <select
              value={tempRole}
              onChange={(e) => setTempRole(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border outline-none bg-white transition-colors cursor-pointer"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink)' }}
            >
              <option value="">모든 역할</option>
              <option value="USER">일반 유저 (USER)</option>
              <option value="HUNTER">헌터 (HUNTER)</option>
              <option value="ADMIN">관리자 (ADMIN)</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: 'var(--ink)' }}
            >
              조회
            </button>
          </div>

          {/* 회원 테이블 데이터 */}
          <div
            className="overflow-hidden"
            style={{
              background: '#fff',
              border: '1px solid var(--hair-2)',
              borderRadius: 20,
              boxShadow: '0 2px 24px -8px rgba(29,58,46,.06)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid var(--hair-2)' }}>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>회원 번호</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>이메일</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>닉네임</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>역할</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>상태</th>
                    <th className="p-4 font-semibold text-right pr-6" style={{ color: 'var(--ink-2)' }}>관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--hair-2)]">
                  {isDataLoading ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-sm" style={{ color: 'var(--ink-2)' }}>
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-2) transparent var(--brand-2) transparent' }} />
                          로딩 중입니다...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-sm text-red-500 font-medium">
                        데이터를 불러오는 데 실패했습니다. ({error.message})
                      </td>
                    </tr>
                  ) : !data || data.content.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-sm" style={{ color: 'var(--ink-2)' }}>
                        조회된 회원 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    data.content.map((usr) => {
                      const isSuspended = usr.accountStatus === 'SUSPENDED'
                      return (
                        <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-medium" style={{ color: 'var(--ink)' }}>{usr.id}</td>
                          <td className="p-4" style={{ color: 'var(--ink)' }}>{usr.email}</td>
                          <td className="p-4" style={{ color: 'var(--ink)' }}>{usr.nickname}</td>
                          <td className="p-4">
                            <span
                              className="font-bold text-xs px-2.5 py-1 rounded-full"
                              style={{
                                background: usr.role === 'HUNTER' ? 'rgba(46,140,104,.1)' : 'rgba(29,29,31,.06)',
                                color: usr.role === 'HUNTER' ? 'var(--brand-2)' : 'var(--ink)',
                              }}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {isSuspended ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-red-600 bg-red-50">
                                🚫 정지됨
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-emerald-600 bg-emerald-50">
                                ✓ 정상
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6 whitespace-nowrap">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSuspend(usr.id, 7)}
                                disabled={isSuspended || suspendMutation.isLoading}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none bg-white hover:bg-amber-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ borderColor: 'var(--hair-2)', color: '#d97706' }}
                              >
                                7일 정지
                              </button>
                              <button
                                onClick={() => handleSuspend(usr.id, -1)}
                                disabled={isSuspended || suspendMutation.isLoading}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none bg-white hover:bg-red-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ borderColor: 'var(--hair-2)', color: 'var(--accent)' }}
                              >
                                영구 정지
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이징 영역 */}
            {data && data.totalPages > 0 && (
              <div className="flex items-center justify-between p-5 border-t border-[var(--hair-2)] bg-gray-50/50">
                <span className="text-xs" style={{ color: 'var(--ink-2)' }}>
                  총 {data.totalPages} 페이지 중 {data.number + 1} 페이지
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={data.first}
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                    style={{ borderColor: 'var(--hair-2)', color: 'var(--ink-2)' }}
                  >
                    이전
                  </button>
                  <button
                    disabled={data.last}
                    onClick={() => setPage((prev) => Math.min(data.totalPages - 1, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                    style={{ borderColor: 'var(--hair-2)', color: 'var(--ink-2)' }}
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
