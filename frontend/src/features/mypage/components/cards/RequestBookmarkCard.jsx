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
export default function RequestBookmarkCard({ request, onRemoveBookmark }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4 hover:border-green-200 transition-colors">
      {/* 본문: 제목 + 위치 */}
      <div className="flex-1 min-w-0">
        <a
          href={`/requestView/detail/${request.requestId}`}
          className="block text-base font-semibold text-gray-900 hover:text-green-700 line-clamp-1"
        >
          {request.title}
        </a>
        {request.approxLocation && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <span aria-hidden="true">📍</span>
            <span>{request.approxLocation}</span>
          </div>
        )}
      </div>

      {/* 찜 해제 버튼 */}
      <button
        type="button"
        onClick={() => onRemoveBookmark(request)}
        className="shrink-0 px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        찜 해제
      </button>
    </article>
  )
}