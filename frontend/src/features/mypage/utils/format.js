export function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '-'

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}


export function formatDateTime(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '-'

  const date = formatDate(isoString)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${date} ${hh}:${mm}`
}

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