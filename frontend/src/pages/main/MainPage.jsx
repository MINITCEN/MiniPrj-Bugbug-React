import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchMainStats } from '../../shared/api/mainApi'
import { fetchMosquitoSummary } from '../../shared/api/mosquitoApi'

export default function MainPage() {
  const { isLoggedIn } = useAuthStore()

  const { data: stats } = useQuery({
    queryKey: ['mainStats'],
    queryFn: fetchMainStats,
  })

  const { data: mosquito } = useQuery({
    queryKey: ['mosquitoSummary'],
    queryFn: () => fetchMosquitoSummary(),
  })

  const handleRequestCta = () => {
    window.location.href = isLoggedIn ? '/requestForm' : '/login'
  }

  return (
    <div className="bg-white">
      <HeroSection onRequestClick={handleRequestCta} stats={stats} />
      <ProcessSection />
      <MosquitoSection mosquito={mosquito?.detail} />
    </div>
  )
}

/* ─── Hero ─────────────────────────────────────────── */
function HeroSection({ onRequestClick, stats }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-8">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          지금도 의뢰가 접수되고 있어요
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
          해충 문제,<br />
          <span className="text-green-600">5분 안에</span> 해결
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          의뢰를 등록하면 신원 인증된 전문 헌터가 직접 연락합니다.<br />
          빠르고 안전하게, 사후 관리까지.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-center">
          <StatItem value={stats ? `${stats.totalRequests.toLocaleString()}건` : '—'} label="누적 해결 의뢰" />
          <div className="w-px bg-gray-200 self-stretch" />
          <StatItem value={stats ? `${stats.averageRating}점` : '—'} label="평균 고객 평점" />
          <div className="w-px bg-gray-200 self-stretch" />
          <StatItem value={stats ? `${stats.activeHunters.toLocaleString()}명` : '—'} label="활동 중인 헌터" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <button
            onClick={onRequestClick}
            className="px-8 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 text-base"
          >
            지금 바로 의뢰 등록하기
          </button>
          <a href="/service-intro" className="px-8 py-3.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors text-base">
            서비스 알아보기 →
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── 프로세스 카드 ──────────────────────────────────── */
const PROCESS_STEPS = [
  {
    step: '01',
    title: '상황을 적고 올리면',
    desc: '해충 종류, 발생 위치, 상황을 간단히 작성하고 의뢰를 등록하세요. 5분이면 충분합니다.',
    icon: '📋',
  },
  {
    step: '02',
    title: '헌터가 먼저 채팅을 시작합니다',
    desc: '신원 인증된 전문 헌터가 의뢰를 확인하고 직접 연락합니다. 기다릴 필요 없어요.',
    icon: '💬',
  },
]

function ProcessSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">이렇게 간단합니다</h2>
          <p className="text-gray-500 mt-3">복잡한 절차 없이 딱 두 단계면 됩니다</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {PROCESS_STEPS.map((s) => (
            <div key={s.step} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                {s.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-green-600 tracking-widest">STEP {s.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 해충 활동 지수 위젯 ────────────────────────────── */
const STATUS_COLOR = {
  '쾌적': { bg: 'bg-blue-50',   text: 'text-blue-600',   bar: 'bg-blue-400'   },
  '관심': { bg: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-400' },
  '주의': { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-400' },
  '불쾌': { bg: 'bg-red-50',    text: 'text-red-600',    bar: 'bg-red-500'    },
}

function MosquitoSection({ mosquito }) {
  const color = STATUS_COLOR[mosquito?.mosquitoStatus] ?? STATUS_COLOR['관심']
  const index = mosquito?.mosquitoIndex ?? 0
  const barWidth = `${Math.min(index, 100)}%`

  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">우리 동네 해충 활동 지수</h2>
        <p className="text-gray-500 mt-3">서울 강남구 기준 · 매일 업데이트</p>
      </div>

      {mosquito ? (
        <div className={`max-w-xl mx-auto rounded-2xl p-8 ${color.bg} border border-gray-100`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">{mosquito.regionName} · {mosquito.mosquitoIndexDate}</p>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">{index.toFixed(1)}<span className="text-lg font-normal text-gray-500"> / 100</span></p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${color.text} bg-white shadow-sm`}>
              {mosquito.mosquitoStatus}
            </span>
          </div>

          {/* 지수 바 */}
          <div className="w-full bg-white rounded-full h-3 mb-6 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-700 ${color.bar}`} style={{ width: barWidth }} />
          </div>

          {/* 날씨 정보 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <WeatherItem icon="🌡️" label="기온" value={mosquito.temperature != null ? `${mosquito.temperature}°C` : '—'} />
            <WeatherItem icon="💧" label="습도" value={mosquito.humidity != null ? `${mosquito.humidity}%` : '—'} />
            <WeatherItem icon="🌤️" label="하늘" value={mosquito.skyStatus ?? '—'} />
          </div>

          <p className="text-center mt-6">
            <a href="/mosquito-map" className="text-sm text-green-600 hover:underline font-medium">
              전체 지역 지도 보기 →
            </a>
          </p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto h-64 bg-gray-100 rounded-2xl animate-pulse" />
      )}
    </section>
  )
}

/* ─── 공통 소형 컴포넌트 ─────────────────────────────── */
function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}

function WeatherItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  )
}
