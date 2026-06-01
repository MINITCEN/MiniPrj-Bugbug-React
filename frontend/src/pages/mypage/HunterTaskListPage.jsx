/**
 * 수행 의뢰 목록 페이지 (헌터 본인이 신청한 의뢰들).
 * 경로: /mypage/hunter/tasks
 * 권한: HUNTER 전용
 *
 * 8단계의 패턴(목록 + 페이지네이션 + 카드 + 빈 상태)을 그대로 적용.
 */
import { useState } from 'react'
import { useHunterTasks } from '../../features/mypage/hooks/queries'
import HunterTaskCard from '../../features/mypage/components/cards/HunterTaskCard'
import Pagination from '../../features/mypage/components/Pagination'
import EmptyState from '../../features/mypage/components/EmptyState'

export default function HunterTaskListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useHunterTasks(page)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수행 의뢰</h1>
        <p className="mt-1 text-sm text-gray-500">
          내가 신청하거나 수행 중·완료한 의뢰의 진행 상황을 확인할 수 있습니다.
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          수행 의뢰 목록을 불러오지 못했습니다.
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="수행 중인 의뢰가 없습니다"
          description="공개된 의뢰 목록에서 마음에 드는 의뢰에 지원해보세요."
          actionLabel="의뢰 둘러보기"
          actionHref="/wholeRequestList"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((task) => (
              <HunterTaskCard key={task.requestId} task={task} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse"
        >
          <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}