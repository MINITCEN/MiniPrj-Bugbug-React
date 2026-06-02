/**
 * 마이페이지 공용 Button.
 *
 * variant × size 매트릭스를 단일 컴포넌트로 일관.
 * 사이드바 CTA, 카드 액션, 모달 footer, EmptyState 액션 모두 이 컴포넌트로.
 *
 * Props:
 *  - variant: 'primary' | 'secondary' | 'ghost' | 'danger' (기본 primary)
 *  - size: 'sm' | 'md' (기본 md)
 *  - as: 'button' | 'a' | React.ElementType (기본 'button')
 *       react-router의 Link 등도 그대로 넘길 수 있음.
 *  - 그 외 props는 underlying 엘리먼트에 그대로 전달.
 */

const VARIANT_CLASS = {
  primary:
    'bg-brand text-white border border-transparent ' +
    'hover:bg-brand-dark active:bg-brand-dark ' +
    'disabled:bg-hair disabled:text-muted disabled:cursor-not-allowed',
  secondary:
    'bg-white text-brand border border-brand/30 ' +
    'hover:bg-brand/5 active:bg-brand/10 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-white text-ink-2 border border-hair ' +
    'hover:bg-hair/40 active:bg-hair/60 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-accent text-white border border-transparent ' +
    'hover:brightness-95 active:brightness-90 ' +
    'disabled:bg-hair disabled:text-muted disabled:cursor-not-allowed',
}

const SIZE_CLASS = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  as: Component = 'button',
  className = '',
  type,
  children,
  ...rest
}) {
  // <button>일 때만 기본 type="button" 부여 (form submit 사고 방지)
  const buttonType = Component === 'button' ? (type ?? 'button') : undefined

  const base = 'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors'
  const cls = `${base} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()

  return (
    <Component type={buttonType} className={cls} {...rest}>
      {children}
    </Component>
  )
}
