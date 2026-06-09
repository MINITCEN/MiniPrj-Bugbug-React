import { useState } from 'react'
import { useMyRequests } from '../../features/mypage/hooks/queries'
import RequestCard from '../../features/mypage/components/cards/RequestCard'
import Pagination from '../../features/mypage/components/Pagination'
import EmptyState from '../../features/mypage/components/EmptyState'
import { ClipboardList } from 'lucide-react'
import ReviewFormModal from '../../features/mypage/components/modals/ReviewFormModal'

export default function RequestListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMyRequests(page)

  const [reviewTarget, setReviewTarget] = useState(null)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">나의 의뢰</h1>
        <p className="mt-1 text-sm text-ink-2">
          내가 등록한 의뢰의 진행 상황을 확인하고 리뷰를 작성할 수 있습니다.
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          의뢰 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="등록한 의뢰가 없습니다"
          description="첫 의뢰를 등록하고 헌터에게 도움을 받아보세요."
          actionLabel="의뢰 등록하러 가기"
          actionHref="/requestForm"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((req) => (
              <RequestCard
                key={req.requestId}
                request={req}
                onWriteReview={(r) => setReviewTarget(r)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ReviewFormModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        mode="create"
        request={reviewTarget}
      />
    </div>
  )
}

function LoadingPlaceholder() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface rounded-[18px] border border-hair p-5 animate-pulse"
        >
          <div className="h-5 bg-hair rounded w-2/3 mb-2" />
          <div className="h-3 bg-hair rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}