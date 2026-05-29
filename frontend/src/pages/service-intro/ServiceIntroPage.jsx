import { Link } from 'react-router-dom'

export default function ServiceIntroPage() {
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

      <div className="relative z-10 max-w-screen-xl mx-auto px-20 pt-16 pb-20 flex flex-col gap-20">
        <HeroSection />
        <AboutSection />
        <FlowSection />
        <CtaSection />
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center gap-6 pt-10">
      <span className="text-sm font-semibold" style={{ color: 'var(--brand-2)' }}>서비스 소개</span>
      <h1
        className="leading-[1.05] tracking-[-0.045em]"
        style={{ fontSize: 'clamp(48px, 5vw, 80px)', fontWeight: 800, color: 'var(--ink)' }}
      >
        해충 걱정,<br />
        <span style={{ fontWeight: 300, color: 'var(--ink-2)' }}>버그버그가 해결합니다.</span>
      </h1>
      <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--ink-2)' }}>
        의뢰 등록 한 번으로 검증된 헌터를 연결해드립니다.
      </p>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>버그버그란?</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <AboutCard
          title="해충 방제 매칭 플랫폼"
          desc="집이나 사업장에 해충이 나타났을 때, 전문 헌터에게 빠르게 연결해주는 서비스입니다. 사진과 위치만 올리면 근처 헌터가 직접 찾아옵니다."
        />
        <AboutCard
          title="검증된 전문 헌터"
          desc="버그버그의 헌터는 자격 심사를 통과한 전문가들입니다. 후기와 평점을 보고 신뢰할 수 있는 헌터를 선택하세요."
        />
      </div>
    </section>
  )
}

function AboutCard({ title, desc }) {
  return (
    <div
      className="flex flex-col gap-3 p-7"
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid var(--hair-2)',
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
      }}
    >
      <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{desc}</p>
    </div>
  )
}

const FLOW_STEPS = [
  { num: '①', title: '의뢰 등록', desc: '해충 사진·위치를 입력해 의뢰글을 올립니다.' },
  { num: '②', title: '헌터 매칭', desc: '근처 검증된 헌터가 채팅으로 수락합니다.' },
  { num: '③', title: '방제 완료', desc: '현장 방제 후 리뷰를 남겨주세요.' },
]

function FlowSection() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>이용 흐름</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {FLOW_STEPS.map((s) => <FlowCard key={s.num} {...s} />)}
      </div>
    </section>
  )
}

function FlowCard({ num, title, desc }) {
  return (
    <div
      className="flex flex-col gap-4 p-7"
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid var(--hair-2)',
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
      }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center text-lg font-bold"
        style={{ background: 'var(--ink)', color: '#fff', borderRadius: 12 }}
      >
        {num}
      </div>
      <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{desc}</p>
    </div>
  )
}

function CtaSection() {
  return (
    <section className="flex flex-col items-center gap-6 py-10">
      <h2 className="text-3xl font-bold tracking-tight text-center" style={{ color: 'var(--ink)' }}>
        지금 바로 시작해보세요
      </h2>
      <Link
        to="/requestForm"
        className="px-9 py-[18px] text-white font-semibold text-[17px] transition-opacity hover:opacity-90"
        style={{ background: 'var(--ink)', borderRadius: '999px', letterSpacing: '-0.01em' }}
      >
        의뢰 등록하기
      </Link>
    </section>
  )
}