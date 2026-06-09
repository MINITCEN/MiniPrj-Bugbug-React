/**
 * 찜한 헌터 카드 (BookmarkListPage에서 사용).
 *
 * 데이터: MySavedHunterResponseDto
 *   hunterId, hunterName, grade, responseCount
 *
 * 동작:
 *  - 카드 클릭 → 헌터 목록 페이지 (헌터 상세 라우트가 아직 별도 없음)
 *  - [찜 해제] 버튼 → 부모로 위임 (확인 모달 → toggle mutation)
 */
import { getGradeImage } from '../dashboard/constants'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function HunterBookmarkCard({ hunter, onRemoveBookmark }) {
  return (
    <ItemCard className="flex items-center gap-4">
      {/* 등급 훈장 이미지 */}
      <div className="shrink-0 w-14 h-14">
        <img
          src={getGradeImage(hunter.grade)}
          alt={`${hunter.grade ?? '루키'} 등급 훈장`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* 이름 + 메타 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-ink truncate">
          {hunter.hunterName} 헌터
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-2">
          <span className="px-2 py-0.5 rounded-full bg-brand/8 text-brand font-bold">
            {hunter.grade ?? '루키'}
          </span>
          <span aria-hidden="true">·</span>
          <span>완료 {hunter.responseCount ?? 0}건</span>
        </div>
      </div>

      {/* 찜 해제 버튼 */}
      <Button
        variant="danger"
        size="sm"
        onClick={() => onRemoveBookmark(hunter)}
        className="shrink-0"
      >
        찜 해제
      </Button>
    </ItemCard>
  )
}
