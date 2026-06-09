/**
 * 모달용 공통 버튼들 (호환 wrapper).
 *
 * @deprecated 후속 슬라이스(#70~#72)에서 호출부를 새 Button으로 치환.
 * 신규 코드는 ./Button.jsx의 단일 컴포넌트를 사용:
 *   <Button variant="primary|secondary|ghost|danger" size="sm|md" />
 *
 * 기존 호출부 호환을 위해 PrimaryButton/DangerButton/GhostButton export 유지.
 * 내부 구현은 새 Button으로 위임하여 즉시 토큰 톤(brand/accent/hair) 적용.
 */
import Button from './Button'

/** @deprecated `<Button variant="primary" size="md">` 사용 */
export function PrimaryButton({ children, ...props }) {
  return (
    <Button variant="primary" size="md" {...props}>
      {children}
    </Button>
  )
}

/** @deprecated `<Button variant="danger" size="md">` 사용 */
export function DangerButton({ children, ...props }) {
  return (
    <Button variant="danger" size="md" {...props}>
      {children}
    </Button>
  )
}

/** @deprecated `<Button variant="ghost" size="md">` 사용 */
export function GhostButton({ children, ...props }) {
  return (
    <Button variant="ghost" size="md" {...props}>
      {children}
    </Button>
  )
}
