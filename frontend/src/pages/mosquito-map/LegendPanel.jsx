import { STATUS_COLORS, STATUS_GRADES } from '../../features/mosquito-map/constants'

export default function LegendPanel() {
  return (
    <section
      className="p-6 flex flex-col gap-4"
      style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--hair-2)' }}
    >
      <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
        모기지수 등급 안내
      </h2>
      <div className="flex flex-col gap-3">
        {STATUS_GRADES.map((g) => (
          <div key={g.label} className="flex items-start gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: STATUS_COLORS[g.label] }}
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <strong className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{g.label}</strong>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{g.range}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-2)' }}>{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
