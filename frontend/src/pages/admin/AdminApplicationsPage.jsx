import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchHunterApplications, approveHunterApplication, rejectHunterApplication } from '../../features/admin/api/adminApi'
import { logout } from '../../shared/api/authApi'

export default function AdminApplicationsPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [selectedApp, setSelectedApp] = useState(null) // 상세 모달창 상태

  // 1. 관리자 권한 가드
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn || user?.role !== 'ADMIN') {
        alert('권한이 없습니다.')
        navigate('/')
      }
    }
  }, [isAuthLoading, isLoggedIn, user, navigate])

  // 2. React Query를 통한 헌터 신청 목록 패치
  const { data, isLoading: isDataLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminApplications', page],
    queryFn: () => fetchHunterApplications(page, 10),
    keepPreviousData: true,
    enabled: isLoggedIn && user?.role === 'ADMIN',
  })

  // 3. 승인 Mutation
  const approveMutation = useMutation({
    mutationFn: (appId) => approveHunterApplication(appId),
    onSuccess: () => {
      alert('헌터 승인이 성공적으로 완료되었습니다!')
      setSelectedApp(null)
      queryClient.invalidateQueries(['adminApplications'])
    },
    onError: (err) => {
      alert(err.response?.data?.message || '승인 처리 중 오류가 발생했습니다.')
    }
  })

  // 4. 반려 Mutation
  const rejectMutation = useMutation({
    mutationFn: (appId) => rejectHunterApplication(appId),
    onSuccess: () => {
      alert('헌터 신청이 거절 처리되었습니다.')
      setSelectedApp(null)
      queryClient.invalidateQueries(['adminApplications'])
    },
    onError: (err) => {
      alert(err.response?.data?.message || '반려 처리 중 오류가 발생했습니다.')
    }
  })

  const handleApprove = (appId) => {
    if (window.confirm('이 유저의 신청을 승인하고 헌터 권한을 부여하시겠습니까?')) {
      approveMutation.mutate(appId)
    }
  }

  const handleReject = (appId) => {
    if (window.confirm('이 헌터 신청을 정말로 거절하시겠습니까?')) {
      rejectMutation.mutate(appId)
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
        
        {/* 좌측 사이드바 카테고리 (동일 스타일, 헌터 승인 메뉴 액티브) */}
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
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all hover:bg-gray-50"
            style={{ color: 'var(--ink-2)' }}
          >
            <span className="text-base">👤</span> 전체 회원 관리
          </Link>
          
          <Link
            to="/admin/applications"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: 'rgba(46,140,104,.08)',
              color: 'var(--brand-2)',
            }}
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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
                헌터 승인 관리
              </h1>
              <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
                헌터를 희망하는 일반 유저의 신청서를 꼼꼼하게 검토하여 자격을 승인하거나 거절합니다.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-3 sm:mt-0 flex-shrink-0 px-4 py-2.5 text-xs font-semibold rounded-xl border bg-white transition-all hover:bg-gray-50 active:scale-95 text-center"
              style={{ borderColor: 'var(--hair-2)', color: 'var(--ink-2)' }}
            >
              목록 새로고침
            </button>
          </div>

          {/* 헌터 신청 테이블 데이터 */}
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
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>신청서 번호</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>이메일</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>신청자 이름</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>약관 동의</th>
                    <th className="p-4 font-semibold" style={{ color: 'var(--ink-2)' }}>신청일시</th>
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
                        현재 승인 대기 중인 헌터 신청서가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    data.content.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="p-4 font-medium" style={{ color: 'var(--ink)' }}>{app.id}</td>
                        <td className="p-4" style={{ color: 'var(--ink)' }}>{app.email}</td>
                        <td className="p-4" style={{ color: 'var(--ink)' }}>{app.name}</td>
                        <td className="p-4">
                          {app.pledgeAgreed ? (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-emerald-600 bg-emerald-50">
                              동의함
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-red-600 bg-red-50">
                              미동의
                            </span>
                          )}
                        </td>
                        <td className="p-4" style={{ color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(app.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-right pr-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={approveMutation.isLoading || rejectMutation.isLoading}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-white hover:opacity-90 active:scale-95 disabled:opacity-50"
                              style={{ background: 'var(--brand-2)' }}
                            >
                              승인하기
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              disabled={approveMutation.isLoading || rejectMutation.isLoading}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-white hover:opacity-90 active:scale-95 disabled:opacity-50"
                              style={{ background: 'var(--accent)' }}
                            >
                              거절하기
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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

      {/* 프리미엄 상세 모달창 (React의 장점을 살린 고급스러운 UI) */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(29,29,31,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-lg p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 20px 40px -15px rgba(15,40,30,.25)',
              border: '1px solid var(--hair-2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--brand-2)' }}>신청서 상세 검토</span>
                <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--ink)' }}>{selectedApp.name} 님의 신청서</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-700"
                style={{ borderColor: 'var(--hair-2)' }}
              >
                ✕
              </button>
            </div>

            {/* 상세 테이블 정보 */}
            <div className="flex flex-col gap-4 py-2">
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center py-2.5 border-b border-[var(--hair-2)]">
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>신청서 번호</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{selectedApp.id}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center py-2.5 border-b border-[var(--hair-2)]">
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>이메일</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{selectedApp.email}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center py-2.5 border-b border-[var(--hair-2)]">
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>서약동의 여부</span>
                <span className="text-sm">
                  {selectedApp.pledgeAgreed ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">동의완료</span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">미동의</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 items-center py-2.5 border-b border-[var(--hair-2)]">
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>신청일시</span>
                <span className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="p-4 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--bg)', border: '1px solid var(--hair-2)', color: 'var(--ink-2)' }}>
              ⚠️ 승인 즉시 신청자의 회원 권한이 <strong style={{ color: 'var(--brand-2)' }}>HUNTER</strong>로 업그레이드되며, 즉시 의뢰 게시판에서 활동이 가능하게 됩니다. 꼼꼼히 확인 후 승인해 주십시오.
            </div>

            {/* 모달 하단 액션 버튼 */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                className="flex-1 py-3.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                거절하기
              </button>
              <button
                onClick={() => handleApprove(selectedApp.id)}
                disabled={approveMutation.isLoading || rejectMutation.isLoading}
                className="flex-1 py-3.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--brand-2)' }}
              >
                승인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
