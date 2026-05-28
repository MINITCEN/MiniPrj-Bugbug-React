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
      <BottomSection mosquito={mosquito?.detail} />
    </div>
  )
}

/* ─── Hero ─────────────────────────────────────────── */
function HeroSection({ onRequestClick, stats }) {
  return (
    <section className="bg-gradient-to-br from-stone-50 via-white to-green-50/30">
      <div className="max-w-6xl mx-auto px-4 py-20 flex items-center gap-16">

        {/* 좌: 텍스트 영역 */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <span className="text-sm text-gray-400 font-medium tracking-widest uppercase">버그버그</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            의뢰글을 올리면,<br />
            <span className="text-gray-500">헌터가 찾아옵니다.</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-md">
            해충 상황과 위치를 적어 의뢰글을 올리세요. 검증된 헌터가 직접 채팅으로 연락해 약속을 잡습니다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRequestClick}
              className="px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm shadow-sm"
            >
              지금 바로 의뢰 등록하기
            </button>
            <a
              href="/service-intro"
              className="px-4 py-3.5 text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              서비스 알아보기 →
            </a>
          </div>
          <div className="flex items-center gap-8 pt-2">
            <StatItem
              value={stats ? `★ ${stats.averageRating}/5` : '★ —/5'}
              label="의뢰자 평균 평점"
            />
            <div className="w-px h-10 bg-gray-200 self-stretch" />
            <StatItem
              value={stats ? `${stats.totalRequests.toLocaleString()}건` : '—'}
              label="누적 의뢰 수"
            />
            <div className="w-px h-10 bg-gray-200 self-stretch" />
            <StatItem
              value={stats ? `${stats.activeHunters.toLocaleString()}명` : '—'}
              label="활동 중인 헌터"
            />
          </div>
        </div>

        {/* 우: 폰 목업 */}
        <div className="hidden md:flex justify-center flex-shrink-0">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}

function PhoneMockup() {
  return (
    <div className="w-[260px] h-[520px] bg-white rounded-[44px] border-[10px] border-gray-200 shadow-2xl flex flex-col overflow-hidden relative">
      {/* 다이나믹 아일랜드 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-gray-900 rounded-b-3xl z-10" />
      {/* 스크린 */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center mt-5">
        <p className="text-gray-600 text-xs">영상 준비 중</p>
      </div>
      {/* 홈 바 */}
      <div className="h-8 bg-gray-900 flex items-center justify-center">
        <div className="w-20 h-1 bg-gray-600 rounded-full" />
      </div>
    </div>
  )
}

/* ─── 하단 3열 통합 섹션 ─────────────────────────────── */
const PROCESS_STEPS = [
  {
    step: '01',
    label: '의뢰글 작성',
    title: '상황을 적고\n올리세요',
    desc: '해충 종류, 위치, 사진을 첨부해 의뢰글을 등록합니다. 작성에 3분이면 충분합니다.',
  },
  {
    step: '02',
    label: '헌터 연락',
    title: '헌터가 먼저\n채팅을 시작',
    desc: '의뢰글을 본 검증된 헌터들이 직접 채팅으로 연락합니다. 후기와 경력을 보고 선택하세요.',
  },
]

const NATIONAL_SUMMARY = [
  { region: '서울', index: 78 },
  { region: '경기', index: 62 },
  { region: '대전', index: 54 },
  { region: '광주', index: 38 },
  { region: '부산', index: 70 },
  { region: '제주', index: 34 },
]

function BottomSection({ mosquito }) {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {PROCESS_STEPS.map((s) => (
            <ProcessCard key={s.step} {...s} />
          ))}
          <MosquitoCard mosquito={mosquito} />
        </div>
      </div>
    </section>
  )
}

function ProcessCard({ step, label, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col gap-4">
      <span className="text-xs font-bold text-gray-400 tracking-widest">
        {step} · {label}
      </span>
      <h3 className="text-xl font-bold text-gray-900 leading-snug whitespace-pre-line">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

/* ─── 모기지수 다크 카드 ────────────────────────────── */
const MOSQUITO_STATUS_COLOR = {
  '쾌적': 'bg-green-500',
  '관심': 'bg-yellow-400',
  '주의': 'bg-orange-400',
  '불쾌': 'bg-red-500',
  '매우높음': 'bg-red-600',
}

function indexBarColor(index) {
  if (index >= 71) return 'bg-red-500'
  if (index >= 51) return 'bg-orange-400'
  if (index >= 31) return 'bg-yellow-400'
  return 'bg-green-400'
}

function MosquitoCard({ mosquito }) {
  const index = mosquito?.mosquitoIndex ?? 0
  const status = mosquito?.mosquitoStatus ?? '—'
  const regionName = mosquito?.regionName ?? '서울 강남구'
  const statusBadgeColor = MOSQUITO_STATUS_COLOR[status] ?? 'bg-gray-500'

  return (
    <div className="bg-gray-900 rounded-2xl p-8 flex flex-col gap-5 text-white">
      <span className="text-xs font-bold text-gray-400 tracking-widest">03 · 모기지수</span>
      <div>
        <h3 className="text-xl font-bold leading-snug">
          오늘의 지역별<br />해충 활동 지수
        </h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          지역별 모기·해충 활동량을 매일 업데이트합니다.<br />우리 동네 상황을 미리 확인하세요.
        </p>
      </div>

      <div className="flex items-end justify-between gap-4 mt-auto">
        {/* 대표 지수 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">{regionName}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">{index.toFixed(0)}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
          <span className={`self-start mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${statusBadgeColor}`}>
            {status}
          </span>
        </div>

        {/* 전국 현황 (정적 더미) */}
        <div className="flex flex-col gap-1.5 min-w-[110px]">
          <span className="text-xs text-gray-400 mb-0.5">전국 현황</span>
          {NATIONAL_SUMMARY.map(({ region, index: idx }) => (
            <div key={region} className="flex items-center gap-2">
              <span className="text-xs text-gray-300 w-6 shrink-0">{region}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${indexBarColor(idx)}`}
                  style={{ width: `${idx}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-5 text-right shrink-0">{idx}</span>
            </div>
          ))}
        </div>
      </div>

      <a
        href="/mosquito-map"
        className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
      >
        전체 지역 지도 보기 →
      </a>
    </div>
  )
}

/* ─── 공통 소형 컴포넌트 ─────────────────────────────── */
function StatItem({ value, label }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
