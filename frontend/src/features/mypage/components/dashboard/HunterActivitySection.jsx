/**
 * HUNTER 활동 요약 섹션.
 *
 * 두 미니 패널:
 *  - 리뷰 요약: 별점별 막대 그래프 (useMyHunterReviewSummary)
 *  - 최근 활동: 최근 수행 의뢰 (useHunterTasks, 최대 3건)
 *
 * dashboard.js의 renderReviewBars + loadHunterDashboard 일부를 옮긴 부분.
 */
import { Link } from 'react-router-dom'
import { useMyHunterReviewSummary, useHunterTasks } from '../../hooks/queries'

export default function HunterActivitySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ReviewSummaryPanel />
      <RecentTasksPanel />
    </div>
  )
}

/* ───────────── 리뷰 요약 (별점별 막대) ───────────── */

function ReviewSummaryPanel() {
  const { data, isLoading, isError } = useMyHunterReviewSummary()

  // 백엔드 응답: Map<Integer, Long> 형태. 예: { "5": 12, "4": 5, "3": 1, "2": 0, "1": 0 }
  // 키가 문자열로 올 수도 정수로 올 수도 있어서 String 변환으로 통일.
  const counts = data || {}
  const scores = [5, 4, 3, 2, 1]
  const total = scores.reduce((sum, s) => sum + Number(counts[s] ?? counts[String(s)] ?? 0), 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">리뷰 요약</h3>
        <Link to="/mypage/reviews" className="text-xs text-green-700 hover:underline">
          리뷰 더보기 →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>
      ) : isError ? (
        <p className="text-sm text-gray-400 py-4 text-center">리뷰 요약을 불러오지 못했습니다.</p>
      ) : total === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">아직 받은 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {scores.map((score) => {
            const count = Number(counts[score] ?? counts[String(score)] ?? 0)
            const percent = total ? Math.round((count / total) * 100) : 0
            return (
              <div key={score} className="flex items-center gap-3 text-xs">
                <span className="w-7 shrink-0 text-gray-600">{score}점</span>
                <div
                  className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"
                  aria-label={`${score}점 리뷰 ${count}개`}
                >
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-gray-600">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ───────────── 최근 활동 ───────────── */

function RecentTasksPanel() {
  const { data, isLoading } = useHunterTasks(0)
  const items = data?.content?.slice(0, 3) ?? []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">최근 활동</h3>
        <Link to="/mypage/hunter/tasks" className="text-xs text-green-700 hover:underline">
          더보기 →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">수행 중인 의뢰가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((task) => (
            <li key={task.requestId} className="py-2.5 flex items-center justify-between gap-3">
              <a
                href={`/requestView/detail/${task.requestId}`}
                className="text-sm text-gray-700 hover:text-green-700 truncate flex-1 min-w-0"
              >
                {task.title}
              </a>
              <span className="shrink-0 text-xs text-gray-500">{task.approxLocation}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}