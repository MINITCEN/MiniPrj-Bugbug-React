/**
 * 빈 목록 상태 안내 컴포넌트.
 *
 * 사용 예:
 *   <EmptyState
 *     title="등록한 의뢰가 없습니다"
 *     description="첫 의뢰를 등록하고 헌터에게 도움을 받아보세요."
 *     actionLabel="의뢰 등록하러 가기"
 *     actionHref="/requestForm"
 *   />
 *
 * action은 href 또는 onClick 둘 중 하나만 (둘 다 주면 onClick 우선).
 * 액션이 필요 없으면 actionLabel을 생략.
 */
export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  const hasAction = actionLabel && (onAction || actionHref)

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      {title && <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

      {hasAction && (
        onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            {actionLabel}
          </button>
        ) : (
          <a
            href={actionHref}
            className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            {actionLabel}
          </a>
        )
      )}
    </div>
  )
}