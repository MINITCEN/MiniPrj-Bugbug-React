/**
 * 빈 목록 상태 안내 컴포넌트.
 *
 * 사용 예:
 *   import { Inbox } from 'lucide-react'
 *   <EmptyState
 *     icon={Inbox}
 *     title="등록한 의뢰가 없습니다"
 *     description="첫 의뢰를 등록하고 헌터에게 도움을 받아보세요."
 *     actionLabel="의뢰 등록하러 가기"
 *     actionHref="/requestForm"
 *   />
 *
 * action은 href 또는 onClick 둘 중 하나만 (둘 다 주면 onClick 우선).
 * 액션이 필요 없으면 actionLabel을 생략.
 */
import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  const hasAction = actionLabel && (onAction || actionHref)

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 mb-4 inline-flex items-center justify-center rounded-full bg-hair/40 text-ink-2"
        aria-hidden="true"
      >
        <Icon className="w-7 h-7" />
      </div>
      {title && <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>}
      {description && <p className="text-sm text-ink-2 mb-4">{description}</p>}

      {hasAction && (
        onAction ? (
          <Button variant="primary" size="md" onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        ) : (
          <Button variant="primary" size="md" as="a" href={actionHref} className="mt-2">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}
