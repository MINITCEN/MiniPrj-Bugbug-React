/**
 * 클릭 가능 카드 — 리스트 아이템, 카드형 링크 등에 사용.
 *
 * SectionShell과 동일한 surface 스펙에 hover 효과를 추가:
 *  - hover 시 border 진해짐(--hair) + translateY(-2px)
 *  - cursor pointer
 *
 * Props:
 *  - as: 'article' | 'a' | 'div' | React.ElementType (기본 'article')
 *       react-router Link 등 그대로 받음
 *  - 그 외 props는 underlying 엘리먼트에 전달
 */

const BASE_CLASS =
  'bg-surface rounded-[18px] border border-hair p-5 ' +
  'transition-all duration-200 ' +
  'hover:border-hair-strong hover:-translate-y-0.5'

const SHADOW_STYLE = {
  boxShadow:
    '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
}

export default function ItemCard({
  as: Component = 'article',
  className = '',
  children,
  ...rest
}) {
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
