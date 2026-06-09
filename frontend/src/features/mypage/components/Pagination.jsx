
import { ChevronLeft, ChevronRight } from 'lucide-react'


function getPageWindow(currentPage, totalPages, windowSize = 5) {
  
  const half = Math.floor(windowSize / 2)
  let start = Math.max(0, currentPage - half)
  let end = Math.min(totalPages - 1, start + windowSize - 1)

  start = Math.max(0, Math.min(start, end - windowSize + 1))

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

export default function Pagination({ page, totalPages, onChange }) {
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
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
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
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </PageButton>
    </nav>
  )
}


function PageButton({ children, active = false, disabled = false, ...props }) {
  const baseClass =
    'min-w-[36px] h-9 px-2 inline-flex items-center justify-center text-sm rounded-lg font-medium transition-colors'

  const stateClass = active
    ? 'bg-brand text-white'
    : disabled
    ? 'text-muted cursor-not-allowed'
    : 'text-ink-2 hover:bg-hair/40'

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
