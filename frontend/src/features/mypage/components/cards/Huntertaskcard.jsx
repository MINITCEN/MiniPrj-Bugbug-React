/**
 * 수행 의뢰 카드 (HunterTaskListPage에서 사용).
 *
 * 데이터: HunterTaskResponseDto
 *   requestId, title, status, approxLocation
 *
 * 동작:
 *  - 카드 클릭 → 의뢰 상세 (/requestView/detail/{id}) — 아직 Thymeleaf 페이지
 *  - 상태별 배지 색상은 RequestCard와 동일한 매핑 사용
 */
import { getStatusBadgeClass } from '../../utils/format'

export default function HunterTaskCard({ task }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-green-200 transition-colors">
      {/* 헤더: 제목 + 상태 배지 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={`/requestView/detail/${task.requestId}`}
          className="text-base font-semibold text-gray-900 hover:text-green-700 line-clamp-1 flex-1"
        >
          {task.title}
        </a>
        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadgeClass(task.status)}`}
        >
          {task.status}
        </span>
      </div>

      {/* 메타: 위치 */}
      {task.approxLocation && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span aria-hidden="true">📍</span>
          <span>{task.approxLocation}</span>
        </div>
      )}
    </article>
  )
}