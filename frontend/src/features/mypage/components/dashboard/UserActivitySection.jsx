/**
 * USER 활동 요약 섹션.
 *
 * 두 미니 패널을 좌우로 배치:
 *  - 최근 의뢰 (useMyRequests, 최대 3건)
 *  - 찜한 헌터 (useMySavedHunters, 최대 3건)
 *
 * 각 패널은 "더보기" 링크로 해당 페이지로 이동.
 *
 * dashboard.js의 loadUserDashboard()를 React로 옮긴 부분.
 */
import { Link } from 'react-router-dom'
import { useMyRequests, useMySavedHunters } from '../../hooks/queries'

export default function UserActivitySection() {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">나의 활동</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentRequestsPanel />
        <SavedHuntersPanel />
      </div>
    </section>
  )
}

/* ───────────── 최근 의뢰 ───────────── */

function RecentRequestsPanel() {
  // 대시보드에선 최근 3건만 필요. page=0이 첫 페이지 = 가장 최신.
  const { data, isLoading } = useMyRequests(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <MiniPanel title="최근 의뢰" moreLink="/mypage/requests">
      {isLoading ? (
        <EmptyState text="불러오는 중..." />
      ) : items.length === 0 ? (
        <EmptyState text="최근 등록한 의뢰가 없습니다." />
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
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-50 rounded-full">
                {req.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </MiniPanel>
  )
}

/* ───────────── 찜한 헌터 ───────────── */

function SavedHuntersPanel() {
  const { data, isLoading } = useMySavedHunters(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <MiniPanel title="찜한 헌터" moreLink="/mypage/bookmarks/hunters">
      {isLoading ? (
        <EmptyState text="불러오는 중..." />
      ) : items.length === 0 ? (
        <EmptyState text="찜한 헌터가 없습니다." />
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((hunter) => (
            <li key={hunter.hunterId} className="py-2.5 flex items-center justify-between gap-3">
              <a
                href="/hunter"
                className="text-sm text-gray-700 hover:text-green-700 truncate flex-1 min-w-0"
              >
                {hunter.hunterName} 헌터
              </a>
              <span className="shrink-0 text-xs text-gray-500">
                {hunter.responseCount ?? 0}회 완료
              </span>
            </li>
          ))}
        </ul>
      )}
    </MiniPanel>
  )
}

/* ───────────── 공통 보조 컴포넌트 ───────────── */

function MiniPanel({ title, moreLink, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <Link to={moreLink} className="text-xs text-green-700 hover:underline">
          더보기 →
        </Link>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }) {
  return <p className="text-sm text-gray-400 py-4 text-center">{text}</p>
}