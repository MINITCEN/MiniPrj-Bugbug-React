import { Link } from 'react-router-dom'
import { useHunterSavedRequests } from '../../hooks/queries'
import SectionShell from '../SectionShell'

export default function HunterSavedRequestsSection() {
  const { data, isLoading } = useHunterSavedRequests(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <SectionShell className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-ink">찜한 의뢰</h3>
        <Link to="/mypage/hunter/bookmarks/requests" className="text-xs text-brand hover:underline">
          더보기 →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted py-4 text-center">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">찜한 의뢰가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-hair">
          {items.map((req) => (
            <li key={req.requestId} className="py-2.5 flex items-center justify-between gap-3">
              <a
                href={`/requestView/detail/${req.requestId}`}
                className="text-sm text-ink hover:text-brand truncate flex-1 min-w-0"
              >
                {req.title}
              </a>
              <span className="shrink-0 text-xs text-ink-2">{req.approxLocation}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}
