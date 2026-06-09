import { Link } from 'react-router-dom'
import { useMyRequests, useMySavedHunters } from '../../hooks/queries'
import SectionShell from '../SectionShell'

export default function UserActivitySection() {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink mb-4">나의 활동</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentRequestsPanel />
        <SavedHuntersPanel />
      </div>
    </section>
  )
}

function RecentRequestsPanel() {
  // 대시보드에선 최근 3건만 필요. page=0이 첫 페이지 = 가장 최신.
  const { data, isLoading } = useMyRequests(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <MiniPanel title="최근 의뢰" moreLink="/mypage/requests">
      {isLoading ? (
        <EmptyText text="불러오는 중..." />
      ) : items.length === 0 ? (
        <EmptyText text="최근 등록한 의뢰가 없습니다." />
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
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold text-brand bg-brand/8 rounded-full">
                {req.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </MiniPanel>
  )
}


function SavedHuntersPanel() {
  const { data, isLoading } = useMySavedHunters(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <MiniPanel title="찜한 헌터" moreLink="/mypage/bookmarks/hunters">
      {isLoading ? (
        <EmptyText text="불러오는 중..." />
      ) : items.length === 0 ? (
        <EmptyText text="찜한 헌터가 없습니다." />
      ) : (
        <ul className="divide-y divide-hair">
          {items.map((hunter) => (
            <li key={hunter.hunterId} className="py-2.5 flex items-center justify-between gap-3">
              <a
                href="/hunter"
                className="text-sm text-ink hover:text-brand truncate flex-1 min-w-0"
              >
                {hunter.hunterName} 헌터
              </a>
              <span className="shrink-0 text-xs text-ink-2">
                {hunter.responseCount ?? 0}회 완료
              </span>
            </li>
          ))}
        </ul>
      )}
    </MiniPanel>
  )
}


function MiniPanel({ title, moreLink, children }) {
  return (
    <SectionShell className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-ink">{title}</h3>
        <Link to={moreLink} className="text-xs text-brand hover:underline">
          더보기 →
        </Link>
      </div>
      {children}
    </SectionShell>
  )
}

function EmptyText({ text }) {
  return <p className="text-sm text-muted py-4 text-center">{text}</p>
}
