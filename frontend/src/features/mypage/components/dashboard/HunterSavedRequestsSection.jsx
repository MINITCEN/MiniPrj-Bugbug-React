/**
 * 헌터 찜한 의뢰 섹션 (HUNTER 전용).
 *
 * 위 HunterActivitySection이 2열 grid라 균형을 위해 별도 풀너비 패널로 분리.
 * (기존 dashboard.html에서도 별도 섹션이었음)
 */
import { Link } from 'react-router-dom'
import { useHunterSavedRequests } from '../../hooks/queries'

export default function HunterSavedRequestsSection() {
  const { data, isLoading } = useHunterSavedRequests(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">찜한 의뢰</h3>
        <Link to="/mypage/hunter/bookmarks/requests" className="text-xs text-green-700 hover:underline">
          더보기 →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">찜한 의뢰가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((req) => (
            <li key={req.requestId} className="py-2.5 flex items-center justify-between gap-3">
              <a
                href={`/requestView/detail/${req.requestId}`}
                className="text-sm text-gray-700 hover:text-green-700 truncate flex-1 min-w-0"
              >
                {req.title}
              </a>
              <span className="shrink-0 text-xs text-gray-500">{req.approxLocation}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}