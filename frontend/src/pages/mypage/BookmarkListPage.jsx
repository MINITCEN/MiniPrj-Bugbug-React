import { useState } from 'react'
import { useMySavedHunters } from '../../features/mypage/hooks/queries'
import HunterBookmarkCard from '../../features/mypage/components/cards/HunterBookmarkCard'
import Pagination from '../../features/mypage/components/Pagination'
import EmptyState from '../../features/mypage/components/EmptyState'
import { Heart } from 'lucide-react'
import BookmarkRemoveConfirmModal from '../../features/mypage/components/modals/BookmarkRemoveConfirmModal'

export default function BookmarkListPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMySavedHunters(page)

  const [removeTarget, setRemoveTarget] = useState(null)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">찜한 헌터</h1>
        <p className="mt-1 text-sm text-ink-2">
          관심 있는 헌터를 찜해두고 의뢰 시 빠르게 확인하세요.
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          찜한 헌터 목록을 불러오지 못했습니다.
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="찜한 헌터가 없습니다"
          description="헌터 목록에서 마음에 드는 헌터를 찜해보세요."
          actionLabel="헌터 둘러보기"
          actionHref="/hunter"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((hunter) => (
              <HunterBookmarkCard
                key={hunter.hunterId}
                hunter={hunter}
                onRemoveBookmark={(h) => setRemoveTarget(h)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <BookmarkRemoveConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        hunter={removeTarget}
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
          className="bg-surface rounded-[18px] border border-hair p-5 animate-pulse flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-hair shrink-0" />
          <div className="flex-1">
            <div className="h-5 bg-hair rounded w-2/3 mb-2" />
            <div className="h-3 bg-hair rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}