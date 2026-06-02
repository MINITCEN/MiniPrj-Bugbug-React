/**
 * 정적 컨테이너 카드 — 대시보드 섹션, 배너 등 클릭되지 않는 패널용.
 *
 * 캐넌(헌터찾기 카드)과 통일된 surface 스펙:
 *  - radius 18, border --hair-2, soft 2층 shadow (highlight inset + drop)
 *  - padding 기본 p-5 (sm 이상에서 p-6)
 *
 * 클릭 가능한 카드는 ./ItemCard 사용.
 */

const BASE_CLASS =
  'bg-surface rounded-[18px] border border-hair p-5 sm:p-6'

// 토큰화하지 못한 shadow는 inline style로. Tailwind v4 arbitrary value로도 가능하지만
// 가독성 위해 inline 유지.
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
