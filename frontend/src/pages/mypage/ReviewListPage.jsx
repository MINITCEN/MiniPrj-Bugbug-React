/**
 * 리뷰 관리 페이지.
 * 경로: /mypage/reviews
 * 권한: USER + HUNTER (둘 다 접근 가능)
 *
 * 동작:
 *  - USER: 본인이 작성한 리뷰 목록 + 수정/삭제 가능
 *  - HUNTER: 본인이 USER 시절 작성한 리뷰 목록 (수정/삭제 불가)
 *    → 헌터로서 "받은" 리뷰는 대시보드의 리뷰 막대 그래프에서 요약 확인
 *
 * 리뷰 신규 작성 진입점은 이 페이지가 아닌 RequestListPage의 카드.
 * (어떤 의뢰에 대한 리뷰인지 컨텍스트가 필요해서)
 */
import { useState } from 'react'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { useMyReviews } from '../../features/mypage/hooks/queries'
import ReviewCard from '../../features/mypage/components/cards/ReviewCard'
import Pagination from '../../features/mypage/components/Pagination'
import EmptyState from '../../features/mypage/components/EmptyState'
import { MessageSquareText } from 'lucide-react'
import ReviewFormModal from '../../features/mypage/components/modals/ReviewFormModal'
import ReviewDeleteConfirmModal from '../../features/mypage/components/modals/ReviewDeleteConfirmModal'

export default function ReviewListPage() {
  const { user } = useAuthStore()
  const canEdit = user?.role === 'USER'  // 작성/수정/삭제는 USER만

  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useMyReviews(page)

  // 모달 타겟 관리 (어떤 리뷰를 수정/삭제할지)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const items = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">나의 리뷰</h1>
        <p className="mt-1 text-sm text-gray-500">
          {canEdit
            ? '작성한 리뷰를 확인하고 수정하거나 삭제할 수 있습니다.'
            : '의뢰자로 활동했을 때 작성한 리뷰 목록입니다.'}
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder />
      ) : isError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          리뷰 목록을 불러오지 못했습니다.
        </p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="작성한 리뷰가 없습니다"
          description={
            canEdit
              ? '완료된 의뢰에 대해 리뷰를 남길 수 있습니다.'
              : '의뢰자로 작성한 리뷰가 아직 없습니다.'
          }
          actionLabel={canEdit ? '내 의뢰 보러 가기' : undefined}
          actionHref={canEdit ? '/mypage/requests' : undefined}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                canEdit={canEdit}
                onEdit={(r) => setEditTarget(r)}
                onDelete={(r) => setDeleteTarget(r)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* 수정 모달 */}
      <ReviewFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        mode="update"
        review={editTarget}
      />

      {/* 삭제 확인 모달 */}
      <ReviewDeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        review={deleteTarget}
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
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse"
        >
          <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-1" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}