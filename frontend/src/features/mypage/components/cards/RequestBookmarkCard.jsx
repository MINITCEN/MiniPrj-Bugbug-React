/**
 * 찜한 의뢰 카드 (HunterBookmarkListPage에서 사용).
 *
 * 데이터: HunterSavedRequestDto
 *   requestId, title, approxLocation
 *
 * 동작:
 *  - 카드 클릭 → 의뢰 상세 (/requestView/detail/{id})
 *  - [찜 해제] 버튼 → 부모로 위임 (확인 모달 → toggle mutation)
 */
import { MapPin } from 'lucide-react'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function RequestBookmarkCard({ request, onRemoveBookmark }) {
  return (
    <ItemCard className="flex items-start gap-4">
      {/* 본문: 제목 + 위치 */}
      <div className="flex-1 min-w-0">
        <a
          href={`/requestView/detail/${request.requestId}`}
          className="block text-base font-semibold text-ink hover:text-brand line-clamp-1"
        >
          {request.title}
        </a>
        {request.approxLocation && (
          <div className="flex items-center gap-1 mt-1 text-xs text-ink-2">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{request.approxLocation}</span>
          </div>
        )}
      </div>

      {/* 찜 해제 버튼 */}
      <Button
        variant="danger"
        size="sm"
        onClick={() => onRemoveBookmark(request)}
        className="shrink-0"
      >
        찜 해제
      </Button>
    </ItemCard>
  )
}
