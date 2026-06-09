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
  const buttonType = Component === 'button' ? (type ?? 'button') : undefined

  const base = 'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors'
  const cls = `${base} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()

  return (
    <Component type={buttonType} className={cls} {...rest}>
      {children}
    </Component>
  )
}
