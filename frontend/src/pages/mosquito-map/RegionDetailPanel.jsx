import { STATUS_BG, STATUS_COLORS } from '../../features/mosquito-map/constants'

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function fmtTime(t) {
  if (!t || t.length < 4) return '-'
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`
}

function barFill(idx) {
  if (idx == null) return '#e5e7eb'
  if (idx >= 75) return STATUS_COLORS['불쾌']
  if (idx >= 50) return STATUS_COLORS['주의']
  if (idx >= 25) return STATUS_COLORS['관심']
  return STATUS_COLORS['쾌적']
}

export default function RegionDetailPanel({ summary, isLoading }) {
  if (isLoading) {
    return (
      <aside
        className="p-6"
        style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
      >
        <p className="text-sm" style={{ color: 'var(--muted)' }}>불러오는 중...</p>
      </aside>
    )
  }

  if (!summary) {
    return (
      <aside
        className="p-6"
        style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
      >
        <p className="text-sm" style={{ color: 'var(--muted)' }}>지역을 선택해주세요.</p>
      </aside>
    )
  }

  const d = summary.detail
  const trend = summary.trend ?? []

  return (
    <aside
      className="p-6 flex flex-col gap-6"
      style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
    >
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          지역 상세 정보
        </span>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
            {d.regionName ?? '-'}
          </h2>
          {d.mosquitoStatus && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: STATUS_BG[d.mosquitoStatus],
                color: STATUS_COLORS[d.mosquitoStatus],
              }}
            >
              {d.mosquitoStatus}
            </span>
          )}
        </div>
      </div>

      {/* 모기지수 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold" style={{ color: 'var(--ink-2)' }}>모기지수</span>
        <div className="flex items-baseline gap-2">
          <div className="font-extrabold leading-none" style={{ fontSize: 48, letterSpacing: '-0.045em', color: 'var(--ink)' }}>
            {d.mosquitoIndex != null ? Math.round(d.mosquitoIndex) : '—'}
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>/ 100</div>
          <div className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
            모기지수 기준 {fmtDate(d.mosquitoIndexDate)}
          </div>
        </div>
      </div>

      {/* 날씨 */}
      <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--hair-2)' }}>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--ink-2)' }}>날씨</span>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            날씨 발표 {fmtDate(d.weatherBaseDate)} {fmtTime(d.weatherBaseTime)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="기온" value={d.temperature != null ? `${d.temperature}℃` : '-'} />
          <InfoRow label="습도" value={d.humidity != null ? `${d.humidity}%` : '-'} />
          <InfoRow label="하늘" value={d.skyStatus ?? '-'} />
          <InfoRow label="강수" value={d.precipitationType ?? '-'} />
          <InfoRow label="풍속" value={d.windSpeed != null ? `${d.windSpeed} m/s` : '-'} />
          <InfoRow label="강수량" value={d.precipitation ?? '-'} />
        </div>
      </div>

      {/* 7일 추이 */}
      <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--hair-2)' }}>
        <span className="text-xs font-bold" style={{ color: 'var(--ink-2)' }}>최근 7일 추이</span>
        {trend.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>데이터 없음</p>
        ) : (
          <TrendLineChart trend={trend} />
        )}
      </div>
    </aside>
  )
}

function TrendLineChart({ trend }) {
  const W = 300
  const H = 90
  const PAD_X = 14
  const PAD_TOP = 18
  const PAD_BOTTOM = 22

  const values = trend.map((t) => t.index ?? 0)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const rawRange = dataMax - dataMin
  const padding = rawRange === 0 ? 5 : rawRange * 0.25
  const yMin = dataMin - padding
  const yMax = dataMax + padding
  const yRange = yMax - yMin || 1

  const chartH = H - PAD_TOP - PAD_BOTTOM
  const chartW = W - PAD_X * 2

  const points = trend.map((t, i) => {
    const x = PAD_X + (trend.length === 1 ? chartW / 2 : (i / (trend.length - 1)) * chartW)
    const y = PAD_TOP + chartH - ((t.index ?? 0) - yMin) / yRange * chartH
    return { x, y, idx: t.index, date: t.date }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + chartH} L ${points[0].x} ${PAD_TOP + chartH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-2, #2e8c68)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--brand-2, #2e8c68)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#trendArea)" />
      <path d={linePath} fill="none" stroke="var(--ink, #1d3a2e)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p) => (
        <g key={p.date}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={barFill(p.idx)} stroke="#fff" strokeWidth="1.5" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink, #1d3a2e)">
            {Math.round(p.idx ?? 0)}
          </text>
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--muted, #8a8a8a)">
            {new Date(p.date).getDate()}
          </text>
        </g>
      ))}
    </svg>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2" style={{ background: 'var(--bg-soft, #f6f4ee)', borderRadius: 8 }}>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}
