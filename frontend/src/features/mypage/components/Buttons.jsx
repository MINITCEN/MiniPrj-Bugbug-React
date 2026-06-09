import Button from './Button'

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
