import { STATUS_COLORS, STATUS_GRADES } from '../../features/mosquito-map/constants'

export default function LegendPanel() {
  return (
    <section
      className="flex-1 p-6 flex flex-col gap-5"
      style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
    >
      <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
        모기지수 등급 안내
      </h2>
      <div className="flex-1 flex flex-col justify-around gap-4">
        {STATUS_GRADES.map((g) => (
          <div key={g.label} className="flex items-start gap-3">
            <span
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ background: STATUS_COLORS[g.label] }}
            />
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <strong className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{g.label}</strong>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>{g.range}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-2)' }}>{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
