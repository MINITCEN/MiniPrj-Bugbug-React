import { getGradeImage } from '../dashboard/constants'
import ItemCard from '../ItemCard'
import Button from '../Button'

export default function HunterBookmarkCard({ hunter, onRemoveBookmark }) {
  return (
    <ItemCard className="flex items-center gap-4">
  
      <div className="shrink-0 w-14 h-14">
        <img
          src={getGradeImage(hunter.grade)}
          alt={`${hunter.grade ?? '루키'} 등급 훈장`}
          className="w-full h-full object-contain"
        />
      </div>

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
