import { STATUS_BG, STATUS_COLORS } from '../../features/mosquito-map/constants'

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
      <div className="flex items-baseline gap-2">
        <div className="font-extrabold leading-none" style={{ fontSize: 48, letterSpacing: '-0.045em', color: 'var(--ink)' }}>
          {d.mosquitoIndex != null ? Math.round(d.mosquitoIndex) : '—'}
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>/ 100</div>
        <div className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>
          기준: {fmtDate(d.mosquitoIndexDate)}
        </div>
      </div>

      {/* 날씨 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow label="기온" value={d.temperature != null ? `${d.temperature}℃` : '-'} />
        <InfoRow label="습도" value={d.humidity != null ? `${d.humidity}%` : '-'} />
        <InfoRow label="하늘" value={d.skyStatus ?? '-'} />
        <InfoRow label="강수" value={d.precipitationType ?? '-'} />
        <InfoRow label="풍속" value={d.windSpeed != null ? `${d.windSpeed} m/s` : '-'} />
        <InfoRow label="기준 시각" value={d.weatherBaseTime ?? '-'} />
      </div>

      {/* 7일 추이 */}
      <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--hair-2)' }}>
        <span className="text-xs font-bold" style={{ color: 'var(--ink-2)' }}>최근 7일 추이</span>
        <div className="flex items-end gap-1.5 h-24">
          {trend.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>데이터 없음</p>
          )}
          {trend.map((t) => {
            const height = t.index != null ? Math.max(4, Math.round(t.index)) : 4
            return (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm"
                  style={{ height: `${height}%`, background: barFill(t.index) }}
                  title={`${fmtDate(t.date)} · ${Math.round(t.index ?? 0)}`}
                />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {new Date(t.date).getDate()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
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
