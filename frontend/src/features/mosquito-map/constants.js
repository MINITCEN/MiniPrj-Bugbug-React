export const DEFAULT_REGION_ID = 1168000000

export const STATUS_COLORS = {
  쾌적: '#2e8c68',
  관심: '#e5a50a',
  주의: '#e5573a',
  불쾌: '#c83a1f',
}

export const STATUS_BG = {
  쾌적: 'rgba(46,140,104,.15)',
  관심: 'rgba(229,165,10,.18)',
  주의: 'rgba(229,87,58,.18)',
  불쾌: 'rgba(200,58,31,.20)',
}

export const STATUS_GRADES = [
  { label: '불쾌', range: '75 - 100', desc: '모기 활동이 매우 활발해 불쾌감이 크게 느껴지는 단계입니다.' },
  { label: '주의', range: '50 - 74',  desc: '실외 활동 시 모기 노출 가능성이 높아 주의가 필요한 구간입니다.' },
  { label: '관심', range: '25 - 49',  desc: '모기 활동이 시작되는 구간으로 기본적인 대비를 권장합니다.' },
  { label: '쾌적', range: '0 - 24',   desc: '모기 활동이 낮은 편이라 비교적 쾌적한 상태입니다.' },
]

export function statusFromIndex(index) {
  if (index == null) return null
  if (index >= 75) return '불쾌'
  if (index >= 50) return '주의'
  if (index >= 25) return '관심'
  return '쾌적'
}
