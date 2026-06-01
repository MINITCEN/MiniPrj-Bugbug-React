import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchHunters, toggleSavedHunter } from '../../shared/api/hunterApi'
import { getGradeImage } from '../../features/mypage/components/dashboard/constants'

const GRADE_TABS = [
  { label: '전체', value: null },
  { label: '루키', value: '루키' },
  { label: '브론즈', value: '브론즈' },
  { label: '실버', value: '실버' },
  { label: '골드', value: '골드' },
  { label: '레전드', value: '레전드' },
]

const GRADE_STYLE = {
  루키:  { background: 'rgba(134,134,139,.12)', color: 'var(--muted)' },
  브론즈: { background: 'rgba(180,120,50,.12)',  color: '#7a4a10' },
  실버:  { background: 'rgba(120,130,150,.14)', color: '#4a5568' },
  골드:  { background: 'rgba(229,165,10,.14)',  color: '#7a5700' },
  레전드: { background: 'rgba(46,140,104,.14)',  color: 'var(--brand)' },
}

const PAGE_SIZE = 12

export default function HunterListPage() {
  const [grade, setGrade] = useState(null)
  const [page, setPage] = useState(0)
  const { user, isLoggedIn } = useAuthStore()
  const queryClient = useQueryClient()
  const isUser = isLoggedIn && user?.role === 'USER'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => fetchHunters({ size: 200 }),
  })

  const bookmarkMutation = useMutation({
    mutationFn: (hunterId) => toggleSavedHunter(hunterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunters'] })
      queryClient.invalidateQueries({ queryKey: ['mypage', 'bookmarks', 'hunters'] })
    },
  })

  const { hunters, totalPages } = useMemo(() => {
    const all = (data?.content ?? (Array.isArray(data) ? data : [])).map((h) => ({ ...h, grade: h.grade ?? '루키' }))
    const filtered = grade ? all.filter((h) => h.grade === grade) : all
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const hunters = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    return { hunters, totalPages }
  }, [data, grade, page])

  const handleGradeChange = (next) => {
    setGrade(next)
    setPage(0)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className="mx-auto w-full max-w-6xl px-6 py-10 flex flex-col gap-8">

        <section>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            헌터 찾기
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
            검증된 헌터들의 프로필을 확인하고 마음에 드는 헌터를 찜해보세요.
          </p>
        </section>

        {/* 등급 탭 */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ borderBottom: '1px solid var(--hair-2)', paddingBottom: 14 }}>
          {GRADE_TABS.map((tab) => {
            const active = grade === tab.value
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleGradeChange(tab.value)}
                className="border-b-2 pb-2 font-semibold transition-colors"
                style={{
                  borderColor: active ? 'var(--brand-2)' : 'transparent',
                  color: active ? 'var(--brand-2)' : 'var(--ink-2)',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 카드 그리드 */}
        {isLoading && (
          <p className="py-20 text-center text-sm" style={{ color: 'var(--ink-2)' }}>헌터 목록을 불러오는 중입니다.</p>
        )}
        {isError && (
          <p className="py-20 text-center text-sm" style={{ color: 'var(--accent)' }}>헌터 목록을 불러오지 못했습니다.</p>
        )}
        {!isLoading && !isError && hunters.length === 0 && (
          <p className="py-20 text-center text-sm" style={{ color: 'var(--ink-2)' }}>해당 등급의 헌터가 없습니다.</p>
        )}

        {!isLoading && !isError && hunters.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hunters.map((hunter) => (
              <HunterCard
                key={hunter.hunterId}
                hunter={hunter}
                isUser={isUser}
                onToggleBookmark={() => bookmarkMutation.mutate(hunter.hunterId)}
                isBookmarkPending={bookmarkMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <PageBtn disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>＜</PageBtn>
            {Array.from({ length: totalPages }, (_, i) => (
              <PageBtn key={i} active={i === page} onClick={() => setPage(i)}>{i + 1}</PageBtn>
            ))}
            <PageBtn disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>＞</PageBtn>
          </div>
        )}
      </main>
    </div>
  )
}

function HunterCard({ hunter, isUser, onToggleBookmark, isBookmarkPending }) {
  return (
    <article
      className="flex flex-col gap-4 p-5 transition-all duration-200"
      style={{
        borderRadius: 18,
        border: '1px solid var(--hair-2)',
        background: '#fff',
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hair)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hair-2)'; e.currentTarget.style.transform = '' }}
    >
      <Link to={`/hunter/${hunter.hunterId}`} className="flex items-center gap-4">
        <img
          src={getGradeImage(hunter.grade)}
          alt={`${hunter.grade} 등급`}
          className="shrink-0 object-contain"
          style={{ width: 56, height: 56 }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold truncate" style={{ color: 'var(--ink)' }}>
            {hunter.name} 헌터
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-bold"
              style={{ borderRadius: 999, padding: '2px 9px', ...(GRADE_STYLE[hunter.grade] ?? {}) }}
            >
              {hunter.grade ?? '루키'}
            </span>
            <span className="text-xs" style={{ color: 'var(--ink-2)' }}>완료 {hunter.completionCount ?? 0}건</span>
          </div>
        </div>
      </Link>

      {isUser && (
        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={isBookmarkPending}
          style={{
            height: 34, borderRadius: 999, border: hunter.isBookmarked ? '1px solid rgba(229,87,58,.4)' : '1px solid var(--hair)',
            background: hunter.isBookmarked ? 'rgba(229,87,58,.07)' : '#fff',
            color: hunter.isBookmarked ? 'var(--accent)' : 'var(--ink-2)',
            fontSize: 13, fontWeight: 600, cursor: isBookmarkPending ? 'not-allowed' : 'pointer',
            opacity: isBookmarkPending ? 0.6 : 1,
          }}
        >
          {hunter.isBookmarked ? '♥ 찜 취소' : '♡ 찜하기'}
        </button>
      )}
    </article>
  )
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 32, minWidth: 32, borderRadius: 8,
        border: active ? 'none' : '1px solid var(--hair)',
        background: active ? 'var(--ink)' : '#fff',
        color: active ? '#fff' : 'var(--ink)',
        fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, padding: '0 8px',
      }}
    >
      {children}
    </button>
  )
}
