import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchMainStats } from '../../shared/api/mainApi'
import { fetchTopMosquito } from '../../shared/api/mosquitoApi'

export default function MainPage() {
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  const { data: stats } = useQuery({ queryKey: ['mainStats'], queryFn: fetchMainStats })
  const { data: topMosquito } = useQuery({
    queryKey: ['mosquitoTop'],
    queryFn: fetchTopMosquito,
    staleTime: 1000 * 60 * 60,
  })

  const handleRequestCta = () => navigate(isLoggedIn ? '/requestView/new' : '/login')

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 960px 720px at 78% 38%, rgba(46,140,104,.13), transparent 62%),
          radial-gradient(ellipse 760px 620px at 8% 78%, rgba(229,87,58,.09), transparent 62%),
          radial-gradient(ellipse 600px 500px at 50% 100%, rgba(29,58,46,.05), transparent 60%),
          #fbfaf6
        `,
      }}
    >
      {/* 도트 그리드 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(29,58,46,.055) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-20 pt-16 pb-8 flex flex-col gap-12">
        <HeroSection onRequestClick={handleRequestCta} stats={stats} />
        <BottomSection topMosquito={topMosquito} />
      </div>
    </div>
  )
}

/* ─── Hero ─────────────────────────────────────────── */
function HeroSection({ onRequestClick, stats }) {
  return (
    <section className="grid gap-10 items-center" style={{ gridTemplateColumns: '1.4fr 340px' }}>
      <div className="flex flex-col gap-6">
        <span className="text-sm font-semibold" style={{ color: 'var(--brand-2)' }}>버그버그</span>

        <h1
          className="leading-[1.05] tracking-[-0.045em]"
          style={{ fontSize: 'clamp(52px, 5.5vw, 92px)', fontWeight: 800, color: 'var(--ink)' }}
        >
          의뢰글을 올리면,<br />
          <span style={{ fontWeight: 300, color: 'var(--ink-2)' }}>헌터가 찾아옵니다.</span>
        </h1>

        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--ink-2)' }}>
          해충 상황과 위치를 적어 의뢰글을 올리세요. 검증된 헌터가 직접 채팅으로 연락해 약속을 잡습니다.
        </p>

        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={onRequestClick}
            className="px-9 py-[18px] text-white font-semibold text-[17px] transition-colors hover:opacity-90"
            style={{ background: 'var(--ink)', borderRadius: '999px', letterSpacing: '-0.01em' }}
          >
            지금 바로 의뢰 등록하기
          </button>
          <Link to="/service-intro" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--ink-2)' }}>
            서비스 알아보기 →
          </Link>
        </div>

        {/* 신뢰 지표 */}
        <div
          className="flex items-center gap-8 pt-6 mt-4"
          style={{ borderTop: '1px solid var(--hair-2)', maxWidth: 640 }}
        >
          <StatItem value={stats ? `★ ${Number(stats.averageRating).toFixed(1)}` : '★ —'} sub="/5" label="의뢰자 평균 평점" />
          <div className="w-px h-9" style={{ background: 'var(--hair-2)' }} />
          <StatItem value={stats ? stats.totalRequests.toLocaleString() : '—'} sub="건" label="누적 의뢰 수" />
          <div className="w-px h-9" style={{ background: 'var(--hair-2)' }} />
          <StatItem value={stats ? stats.activeHunters.toLocaleString() : '—'} sub="명" label="활동 중인 헌터" />
        </div>
      </div>

      <PhoneMockup />
    </section>
  )
}

function StatItem({ value, sub, label }) {
  return (
    <div className="flex flex-col gap-1">
      <b className="leading-none" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--ink)' }}>
        {value}<small className="text-sm font-semibold ml-0.5" style={{ color: 'var(--ink-2)' }}>{sub}</small>
      </b>
      <span className="text-xs" style={{ color: 'var(--ink-2)' }}>{label}</span>
    </div>
  )
}

/* ─── 폰 목업 ─────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="flex justify-center items-center relative">
      {/* 글로우 */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(46,140,104,.22) 0%, rgba(46,140,104,.06) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      {/* 폰 바디 */}
      <div
        className="relative"
        style={{
          width: 260, height: 530,
          background: '#0c0c0e',
          borderRadius: 42,
          padding: 10,
          boxShadow: '0 30px 60px -30px rgba(15,40,30,.35)',
        }}
      >
        {/* 다이나믹 아일랜드 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 8, width: 88, height: 20, background: '#0c0c0e', borderRadius: 12, zIndex: 2 }}
        />
        {/* 스크린 — 영상 자리 보존 */}
        <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: 32, background: '#0c0c0e' }} />
      </div>
    </div>
  )
}

/* ─── 하단 3열 ──────────────────────────────────────── */
const PROCESS_STEPS = [
  { step: '01 · 의뢰글 작성', title: '상황을 적고\n올리세요', desc: '해충 종류, 위치, 사진을 첨부해 의뢰글을 등록합니다. 작성에 3분이면 충분합니다.' },
  { step: '02 · 헌터 연락',   title: '헌터가 먼저\n채팅을 시작', desc: '의뢰글을 본 검증된 헌터들이 직접 채팅으로 연락합니다. 후기와 경력을 보고 선택하세요.' },
]

function BottomSection({ topMosquito }) {
  return (
    <section className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1.4fr' }}>
      {PROCESS_STEPS.map((s) => <ProcessCard key={s.step} {...s} />)}
      <MosquitoCard top={topMosquito?.[0]} others={topMosquito?.slice(1)} />
    </section>
  )
}

function ProcessCard({ step, title, desc }) {
  return (
    <div
      className="flex flex-col gap-3.5 p-7 border transition-all duration-200 cursor-default"
      style={{
        background: '#fff',
        borderColor: 'var(--hair-2)',
        borderRadius: 18,
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -12px rgba(29,58,46,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hair-2)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)' }}
    >
      <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{step}</span>
      <h3 className="text-[22px] font-bold leading-snug tracking-tight whitespace-pre-line">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{desc}</p>
    </div>
  )
}

/* ─── 모기지수 카드 ──────────────────────────────────── */
const STATUS_COLOR = { '쾌적': '#2e8c68', '관심': '#e5a50a', '주의': '#e5573a', '불쾌': '#e5573a' }
const STATUS_BG    = { '쾌적': 'rgba(46,140,104,.18)', '관심': 'rgba(229,165,10,.18)', '주의': 'rgba(229,87,58,.22)', '불쾌': 'rgba(229,87,58,.22)' }

function barFill(idx) {
  if (idx >= 75) return 'var(--accent)'
  if (idx >= 50) return '#e5a50a'
  return 'var(--brand-2)'
}

function MosquitoCard({ top, others }) {
  return (
    <div
      className="p-7 grid gap-6"
      style={{
        background: 'var(--ink)',
        borderRadius: 18,
        gridTemplateColumns: '1fr 200px',
        color: '#fff',
      }}
    >
      {/* 왼쪽 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>03 · 모기지수</span>
        <h3 className="text-[22px] font-bold leading-snug tracking-tight">
          오늘 모기지수<br />가장 높은 지역
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,.65)' }}>
          오늘의 모기지수 상위 7개 지역입니다.
        </p>

        <div className="mt-auto pt-4 flex items-baseline gap-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.12)', marginTop: 'auto' }}>
          <div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,.7)' }}>{top?.location ?? '—'}</div>
            <div className="font-extrabold leading-none" style={{ fontSize: 42, letterSpacing: '-0.045em' }}>
              {top != null ? Math.round(top.index) : '—'}
              <small className="text-sm font-medium ml-1" style={{ color: 'rgba(255,255,255,.5)' }}> / 100</small>
            </div>
          </div>
          {top?.status && (
            <span
              className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: STATUS_BG[top.status] ?? 'rgba(255,255,255,.15)', color: STATUS_COLOR[top.status] ?? '#fff' }}
            >
              {top.status}
            </span>
          )}
        </div>

        <Link to="/mosquito-map" className="text-xs font-medium mt-2 transition-opacity hover:opacity-70" style={{ color: 'var(--brand-2)' }}>
          전체 지역 지도 보기 →
        </Link>
      </div>

      {/* 오른쪽 — 바 차트 */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,.5)' }}>전국 현황</span>
        {(others ?? []).map(({ location, index: idx }) => (
          <div key={location} className="grid items-center gap-2" style={{ gridTemplateColumns: '44px 1fr 28px' }}>
            <span className="text-[13px] font-semibold text-white">{location}</span>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${idx}%`, background: barFill(idx) }} />
            </div>
            <span className="text-xs font-bold text-right" style={{ color: 'rgba(255,255,255,.85)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(idx)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
