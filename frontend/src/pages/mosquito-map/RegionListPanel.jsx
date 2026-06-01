import { useMemo, useState } from 'react'
import { STATUS_BG, STATUS_COLORS } from '../../features/mosquito-map/constants'

export default function RegionListPanel({ regions, selectedRegionId, onSelect }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return regions
    return regions.filter((r) => r.location.includes(q))
  }, [regions, query])

  return (
    <section
      className="p-6 flex flex-col gap-4"
      style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
    >
      <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
        지역 검색
      </h2>

      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'var(--bg-soft, #f6f4ee)', borderRadius: 10 }}
      >
        <span style={{ color: 'var(--muted)' }}>⌕</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="구 이름 입력"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--ink)' }}
        />
      </div>

      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto -mr-1 pr-1">
        {filtered.map((r) => {
          const active = r.regionId === selectedRegionId
          return (
            <button
              key={r.regionId}
              type="button"
              onClick={() => onSelect(r.regionId)}
              className="flex items-center justify-between px-3 py-2.5 text-left transition-all"
              style={{
                borderRadius: 10,
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? '#fff' : 'var(--ink)',
                border: active ? '1px solid var(--ink)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-soft, #f6f4ee)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-sm font-medium">{r.location}</span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: active ? 'rgba(255,255,255,.18)' : STATUS_BG[r.status],
                  color: active ? '#fff' : STATUS_COLORS[r.status],
                }}
              >
                {Math.round(r.index)} · {r.status}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--muted)' }}>
            해당 지역이 없습니다.
          </p>
        )}
      </div>
    </section>
  )
}
