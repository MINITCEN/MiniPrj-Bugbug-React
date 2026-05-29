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

function getStatusClass(status) {
  if (status === '대기 중') return 'bg-red-50 text-red-600'
  if (status === '완료') return 'bg-green-50 text-green-700'
  return 'bg-gray-100 text-gray-600'
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
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">헌터 구인</h1>
          <p className="mt-2 text-sm text-gray-500">
            도움이 필요한 의뢰들을 확인하고 헌터로 활동해보세요!
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6 text-sm">
              {STATUS_TABS.map((tab) => {
                const active = status === tab.value

                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={`border-b-2 pb-2 font-medium transition-colors ${
                      active
                        ? 'border-green-800 text-green-800'
                        : 'border-transparent text-gray-500 hover:text-green-800'
                    }`}
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
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                <option value="latest">최신 순</option>
                <option value="viewCount">조회 수</option>
              </select>

              {canWrite && (
                <Link
                  to="/requestForm"
                  className="inline-flex h-10 items-center rounded-md bg-green-900 px-4 text-sm font-semibold text-white hover:bg-green-800"
                >
                  + 의뢰 등록하기
                </Link>
              )}
            </div>
          </div>

          <div className="overflow-hidden border-y border-gray-900 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-900 text-gray-600">
                  <th className="w-28 px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3 font-semibold">제목</th>
                  <th className="w-44 px-3 py-3 font-semibold">위치</th>
                  <th className="w-44 px-3 py-3 font-semibold">등록 시간</th>
                  <th className="w-24 px-3 py-3 text-right font-semibold">조회 수</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center text-gray-500">
                      의뢰 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center text-red-500">
                      의뢰 목록을 불러오지 못했습니다.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && pageData.requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-12 text-center text-gray-500">
                      등록된 의뢰가 없습니다.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && pageData.requests.map((request) => (
                  <tr key={request.requestId} className="border-b border-gray-200">
                    <td className="px-3 py-4 align-middle">
                      <span className={`inline-flex rounded px-2.5 py-1 text-xs font-bold ${getStatusClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <Link to={`/requestView/detail/${request.requestId}`} className="group block">
                        <strong className="block text-[15px] font-bold text-gray-900 group-hover:text-green-800">
                          {request.title}
                        </strong>
                        <span className="mt-1 block line-clamp-1 text-xs text-gray-500">
                          {request.description || request.content || '-'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-gray-700">{request.approxLocation || '-'}</td>
                    <td className="px-3 py-4 text-gray-700">{formatDateTime(request.createdAt)}</td>
                    <td className="px-3 py-4 text-right text-gray-700">{request.viewCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageData.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={pageData.pageNumber <= 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="h-8 min-w-8 rounded border border-gray-300 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                ＜
              </button>

              {Array.from({ length: pageData.totalPages }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  className={`h-8 min-w-8 rounded border px-2 text-sm ${
                    index === pageData.pageNumber
                      ? 'border-green-900 bg-green-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={pageData.pageNumber >= pageData.totalPages - 1}
                onClick={() => setPage((current) => Math.min(pageData.totalPages - 1, current + 1))}
                className="h-8 min-w-8 rounded border border-gray-300 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
