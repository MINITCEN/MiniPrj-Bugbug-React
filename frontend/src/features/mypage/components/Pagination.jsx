/**
 * Spring Page<T> 응답용 페이지네이션 컴포넌트.
 *
 * 백엔드 응답 구조:
 *   { content, number, totalPages, totalElements, size, ... }
 *
 * 사용 예:
 *   const { data } = useMyRequests(page)
 *   <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />
 *
 * 동작:
 *  - 한 번에 최대 5개 페이지 번호 표시 (현재 페이지 중심)
 *  - 첫/마지막 페이지에선 ◀/▶ 비활성화
 *  - totalPages가 0 또는 1이면 아예 렌더링 안 함 (조건부 호출 불필요)
 */

/**
 * 현재 페이지 주변 windowSize개의 페이지 번호를 계산.
 * Spring은 0-based이지만 UI는 1-based로 표시.
 */
function getPageWindow(currentPage, totalPages, windowSize = 5) {
  // 끝쪽 페이지일 때 윈도우가 음수로 시작하지 않도록 보정
  const half = Math.floor(windowSize / 2)
  let start = Math.max(0, currentPage - half)
  let end = Math.min(totalPages - 1, start + windowSize - 1)

  // 끝에 가까울 때 시작점을 다시 당겨서 항상 windowSize개를 표시
  start = Math.max(0, Math.min(start, end - windowSize + 1))

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

export default function Pagination({ page, totalPages, onChange }) {
  // 페이지가 1개 이하면 페이지네이션 UI 자체가 필요 없음
  if (!totalPages || totalPages <= 1) return null

  const isFirst = page === 0
  const isLast = page === totalPages - 1
  const pageWindow = getPageWindow(page, totalPages)

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-6"
      aria-label="페이지 이동"
    >
      <PageButton
        onClick={() => onChange(page - 1)}
        disabled={isFirst}
        aria-label="이전 페이지"
      >
        ◀
      </PageButton>

      {pageWindow.map((p) => (
        <PageButton
          key={p}
          onClick={() => onChange(p)}
          active={p === page}
          aria-label={`${p + 1}페이지로 이동`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p + 1}
        </PageButton>
      ))}

      <PageButton
        onClick={() => onChange(page + 1)}
        disabled={isLast}
        aria-label="다음 페이지"
      >
        ▶
      </PageButton>
    </nav>
  )
}

/* ───────────── 보조 컴포넌트 ───────────── */

function PageButton({ children, active = false, disabled = false, ...props }) {
  const baseClass =
    'min-w-[36px] h-9 px-2 text-sm rounded-lg font-medium transition-colors'

  const stateClass = active
    ? 'bg-green-600 text-white'
    : disabled
    ? 'text-gray-300 cursor-not-allowed'
    : 'text-gray-700 hover:bg-gray-100'

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseClass} ${stateClass}`}
      {...props}
    >
      {children}
    </button>
  )
}