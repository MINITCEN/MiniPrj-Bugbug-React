import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchRequestList } from '../../shared/api/requestApi'

const STATUS_TABS = [
  { label: '전체', value: null },
  { label: '대기 중', value: '대기 중' },
  { label: '예약 완료', value: '예약 완료' },
  { label: '완료', value: '완료' },
]

const PAGE_SIZE = 10

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getStatusStyle(status) {
  if (status === '대기 중') return { background: 'rgba(229,87,58,.1)', color: '#c0392b' }
  if (status === '예약 완료') return { background: 'rgba(229,165,10,.12)', color: '#7a5700' }
  if (status === '완료') return { background: 'rgba(46,140,104,.12)', color: 'var(--brand)' }
  return { background: 'rgba(232,231,227,.6)', color: 'var(--ink-2)' }
}

function normalizePageResponse(data, { page, status, sortType }) {
  if (!Array.isArray(data)) {
    return {
      requests: data?.content ?? [],
      pageNumber: data?.number ?? page,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    }
  }

  const filtered = status ? data.filter((request) => request.status === status) : data
  const sorted = [...filtered].sort((a, b) => {
    if (sortType === 'viewCount') {
      return Number(b.viewCount ?? 0) - Number(a.viewCount ?? 0)
    }

    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })

  const start = page * PAGE_SIZE
  const requests = sorted.slice(start, start + PAGE_SIZE)

  return {
    requests,
    pageNumber: page,
    totalPages: Math.ceil(sorted.length / PAGE_SIZE),
    totalElements: sorted.length,
  }
}

export default function RequestListPage() {
  const [status, setStatus] = useState(null)
  const [sortType, setSortType] = useState('latest')
  const [page, setPage] = useState(0)
  const { user, isLoggedIn } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['requestList', { page, status, sortType }],
    queryFn: () => fetchRequestList({ page, size: PAGE_SIZE, status, sortType }),
  })

  const pageData = useMemo(
    () => normalizePageResponse(data, { page, status, sortType }),
    [data, page, status, sortType],
  )

  const canWrite = isLoggedIn && user?.role === 'USER'

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus)
    setPage(0)
  }

  const handleSortChange = (event) => {
    setSortType(event.target.value)
    setPage(0)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">

        <section>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            헌터 구인
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
            도움이 필요한 의뢰들을 확인하고 헌터로 활동해보세요!
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {/* 탭 + 컨트롤 */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6 text-sm">
              {STATUS_TABS.map((tab) => {
                const active = status === tab.value
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className="border-b-2 pb-2 font-semibold transition-colors"
                    style={{
                      borderColor: active ? 'var(--brand-2)' : 'transparent',
                      color: active ? 'var(--brand-2)' : 'var(--ink-2)',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortType}
                onChange={handleSortChange}
                style={{
                  height: 38, borderRadius: 999, border: '1px solid var(--hair)',
                  background: '#fff', padding: '0 14px',
                  fontSize: 13, color: 'var(--ink)', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="latest">최신 순</option>
                <option value="viewCount">조회 수</option>
              </select>

              {canWrite && (
                <Link
                  to="/requestView/new"
                  style={{
                    display: 'inline-flex', height: 38, alignItems: 'center',
                    borderRadius: 999, background: 'var(--ink)',
                    padding: '0 18px', fontSize: 13, fontWeight: 600,
                    color: '#fff', textDecoration: 'none',
                  }}
                >
                  + 의뢰 등록하기
                </Link>
              )}
            </div>
          </div>

          {/* 테이블 */}
          <div style={{ borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)', background: '#fff' }}>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                  <th className="w-28 px-3 py-3 font-semibold" style={{ color: 'var(--ink-2)' }}>상태</th>
                  <th className="px-3 py-3 font-semibold" style={{ color: 'var(--ink-2)' }}>제목</th>
                  <th className="w-44 px-3 py-3 font-semibold" style={{ color: 'var(--ink-2)' }}>위치</th>
                  <th className="w-44 px-3 py-3 font-semibold" style={{ color: 'var(--ink-2)' }}>등록 시간</th>
                  <th className="w-24 px-3 py-3 text-right font-semibold" style={{ color: 'var(--ink-2)' }}>조회 수</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center" style={{ color: 'var(--ink-2)' }}>
                      의뢰 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center" style={{ color: 'var(--accent)' }}>
                      의뢰 목록을 불러오지 못했습니다.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && pageData.requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center" style={{ color: 'var(--ink-2)' }}>
                      등록된 의뢰가 없습니다.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && pageData.requests.map((request) => (
                  <tr
                    key={request.requestId}
                    style={{ borderBottom: '1px solid var(--hair-2)', transition: 'background .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fafaf8' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                  >
                    <td className="px-3 py-4 align-middle">
                      <span
                        className="inline-flex text-xs font-bold"
                        style={{ borderRadius: 999, padding: '3px 10px', ...getStatusStyle(request.status) }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <Link to={`/requestView/detail/${request.requestId}`} className="block">
                        <strong className="block text-[15px] font-bold" style={{ color: 'var(--ink)' }}>
                          {request.title}
                        </strong>
                        <span className="mt-1 block line-clamp-1 text-xs" style={{ color: 'var(--ink-2)' }}>
                          {request.description || request.content || '-'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-4" style={{ color: 'var(--ink-2)' }}>{request.approxLocation || '-'}</td>
                    <td className="px-3 py-4" style={{ color: 'var(--ink-2)' }}>{formatDateTime(request.createdAt)}</td>
                    <td className="px-3 py-4 text-right" style={{ color: 'var(--ink-2)' }}>{request.viewCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pageData.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={pageData.pageNumber <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                style={{
                  height: 32, minWidth: 32, borderRadius: 8,
                  border: '1px solid var(--hair)', background: '#fff',
                  padding: '0 8px', fontSize: 13, color: 'var(--ink)',
                  cursor: 'pointer', opacity: pageData.pageNumber <= 0 ? 0.4 : 1,
                }}
                className="disabled:cursor-not-allowed"
              >
                ＜
              </button>

              {Array.from({ length: pageData.totalPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  style={{
                    height: 32, minWidth: 32, borderRadius: 8,
                    border: index === pageData.pageNumber ? 'none' : '1px solid var(--hair)',
                    background: index === pageData.pageNumber ? 'var(--ink)' : '#fff',
                    padding: '0 8px', fontSize: 13,
                    color: index === pageData.pageNumber ? '#fff' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={pageData.pageNumber >= pageData.totalPages - 1}
                onClick={() => setPage((current) => Math.min(pageData.totalPages - 1, current + 1))}
                style={{
                  height: 32, minWidth: 32, borderRadius: 8,
                  border: '1px solid var(--hair)', background: '#fff',
                  padding: '0 8px', fontSize: 13, color: 'var(--ink)',
                  cursor: 'pointer', opacity: pageData.pageNumber >= pageData.totalPages - 1 ? 0.4 : 1,
                }}
                className="disabled:cursor-not-allowed"
              >
                ＞
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
