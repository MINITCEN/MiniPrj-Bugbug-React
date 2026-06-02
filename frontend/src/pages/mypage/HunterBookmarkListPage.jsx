/**
 * 찜한 의뢰 목록 페이지 (헌터가 관심 있는 의뢰들).
 * 경로: /mypage/hunter/bookmarks/requests
 * 권한: HUNTER 전용
 */
import { useState } from 'react'
import { useHunterSavedRequests } from '../../features/mypage/hooks/queries'
import RequestBookmarkCard from '../../features/mypage/components/cards/RequestBookmarkCard'
import Pagination from '../../features/mypage/components/Pagination'
import EmptyState from '../../features/mypage/components/EmptyState'
import { Bookmark } from 'lucide-react'
import RequestBookmarkRemoveConfirmModal from '../../features/mypage/components/modals/RequestBookmarkRemoveConfirmModal'

export default function HunterBookmarkListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useHunterSavedRequests(page)

  // 어떤 의뢰를 해제할지 모달에 전달
  const [removeTarget, setRemoveTarget] = useState(null)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">찜한 의뢰</h1>
        <p className="mt-1 text-sm text-ink-2">
          관심 있는 의뢰를 찜해두고 빠르게 다시 확인하세요.
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          찜한 의뢰 목록을 불러오지 못했습니다.
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="찜한 의뢰가 없습니다"
          description="공개된 의뢰 목록에서 마음에 드는 의뢰를 찜해보세요."
          actionLabel="의뢰 둘러보기"
          actionHref="/requestView/list"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((request) => (
              <RequestBookmarkCard
                key={request.requestId}
                request={request}
                onRemoveBookmark={(r) => setRemoveTarget(r)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <RequestBookmarkRemoveConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        request={removeTarget}
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