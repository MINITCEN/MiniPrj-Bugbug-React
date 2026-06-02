/**
 * 공통 포맷 유틸 (마이페이지 전반).
 *
 * 백엔드의 LocalDateTime이 JSON으로 직렬화되면 "2024-12-01T13:42:11" 형태로 옴.
 * UI 표기를 위해 한국식으로 변환.
 */

/**
 * "2024-12-01T13:42:11" → "2024.12.01"
 */
export function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '-'

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

/**
 * "2024-12-01T13:42:11" → "2024.12.01 13:42"
 */
export function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '-'

  const date = formatDate(isoString)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${date} ${hh}:${mm}`
}

/**
 * 의뢰 상태별 배지 색상 클래스 매핑.
 * Tailwind 클래스를 미리 빌드에 포함시키려면 동적 문자열로 만들면 안 되므로
 * 모든 분기를 명시적으로 작성.
 *
 * 완료는 brand 톤으로 토큰화. 진행중/대기/취소는 상태 의미를 시각적으로
 * 구분하기 위해 의도적으로 다른 hue(blue/amber/neutral)를 유지.
 */
export function getStatusBadgeClass(status) {
  switch (status) {
    case '완료':
      return 'bg-brand/8 text-brand border-brand/15'
    case '진행중':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    case '대기':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case '취소':
      return 'bg-hair/40 text-ink-2 border-hair'
    default:
      return 'bg-hair/30 text-ink-2 border-hair'
  }
}