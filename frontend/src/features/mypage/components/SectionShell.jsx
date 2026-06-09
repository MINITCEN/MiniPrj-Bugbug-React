
const BASE_CLASS =
  'bg-surface rounded-[18px] border border-hair p-5 sm:p-6'


const SHADOW_STYLE = {
  boxShadow:
    '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
}

export default function SectionShell({ as: Component = 'section', className = '', children, ...rest }) {
  return (
    <Component
      className={`${BASE_CLASS} ${className}`.trim()}
      style={SHADOW_STYLE}
      {...rest}
    >
      {children}
    </Component>
  )
}
