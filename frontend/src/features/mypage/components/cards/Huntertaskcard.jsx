import { MapPin } from 'lucide-react'
import { getStatusBadgeClass } from '../../utils/format'
import ItemCard from '../ItemCard'

export default function HunterTaskCard({ task }) {
  return (
    <ItemCard>
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${task.requestId}`}
          className="text-base font-semibold text-ink hover:text-brand line-clamp-1 flex-1"
        >
          {task.title}
        </a>
        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadgeClass(task.status)}`}
        >
          {task.status}
        </span>
      </div>

      {task.approxLocation && (
        <div className="flex items-center gap-1 text-xs text-ink-2">
          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{task.approxLocation}</span>
        </div>
      )}
    </ItemCard>
  )
}
