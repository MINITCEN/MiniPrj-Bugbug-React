import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { fetchHunterProfile, fetchHunterReviews, toggleSavedHunter } from '../../shared/api/hunterApi'
import { getGradeImage } from '../../features/mypage/components/dashboard/constants'

const GRADE_STYLE = {
  루키:  { background: 'rgba(134,134,139,.12)', color: 'var(--muted)' },
  브론즈: { background: 'rgba(180,120,50,.12)',  color: '#7a4a10' },
  실버:  { background: 'rgba(120,130,150,.14)', color: '#4a5568' },
  골드:  { background: 'rgba(229,165,10,.14)',  color: '#7a5700' },
  레전드: { background: 'rgba(46,140,104,.14)',  color: 'var(--brand)' },
}

function StarRating({ rating }) {
  const r = Math.round((rating ?? 0) * 2) / 2
  return (
    <span style={{ color: '#e5a50a', fontSize: 14, letterSpacing: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        i < Math.floor(r) ? '★' : i < r ? '⯨' : '☆'
      )).join('')}
    </span>
  )
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

export default function HunterDetailPage() {
  const { hunterId } = useParams()
  const { user, isLoggedIn } = useAuthStore()
  const queryClient = useQueryClient()
  const isUser = isLoggedIn && user?.role === 'USER'
  const [reviewPage, setReviewPage] = useState(0)

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['hunterProfile', hunterId],
    queryFn: () => fetchHunterProfile(hunterId),
    enabled: Boolean(hunterId),
  })

  const { data: reviewData } = useQuery({
    queryKey: ['hunterReviews', hunterId, reviewPage],
    queryFn: () => fetchHunterReviews(hunterId, { page: reviewPage, size: 5 }),
    enabled: Boolean(hunterId),
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleSavedHunter(hunterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunterProfile', hunterId] })
      queryClient.invalidateQueries({ queryKey: ['hunters'] })
      queryClient.invalidateQueries({ queryKey: ['mypage', 'bookmarks', 'hunters'] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: 'var(--bg)', color: 'var(--ink-2)' }}>
        헌터 정보를 불러오는 중입니다.
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6" style={{ background: 'var(--bg)' }}>
        <div style={{ borderRadius: 12, background: 'rgba(229,87,58,.08)', border: '1px solid rgba(229,87,58,.18)', padding: '14px 18px', fontSize: 14, fontWeight: 500, color: 'var(--accent)', maxWidth: 480, width: '100%' }}>
          {error?.response?.data?.message || '헌터 정보를 불러오지 못했습니다.'}
        </div>
        <Link
          to="/hunter"
          style={{ display: 'inline-flex', height: 40, alignItems: 'center', borderRadius: 999, border: '1px solid var(--hair)', background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
        >
          목록으로
        </Link>
      </div>
    )
  }

  const reviews = reviewData?.content ?? []
  const totalReviewPages = reviewData?.totalPages ?? 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto w-full max-w-6xl px-6 py-10">

        {/* 브레드크럼 */}
        <nav className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
          <Link to="/hunter" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-2)', textDecoration: 'none' }}>
            헌터 찾기
          </Link>
          <span>›</span>
          <span>{profile.name} 헌터</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">

          {/* 왼쪽 — 프로필 카드 (sticky) */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div
              className="flex flex-col gap-5 p-6"
              style={{ borderRadius: 18, border: '1px solid var(--hair-2)', background: '#fff', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)' }}
            >
              {/* 등급 이미지 */}
              <div className="flex justify-center">
                <img
                  src={getGradeImage(profile.grade)}
                  alt={`${profile.grade} 등급`}
                  style={{ width: 100, height: 100, objectFit: 'contain' }}
                />
              </div>

              {/* 이름 + 등급 */}
              <div className="text-center">
                <h1 className="text-xl font-bold" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  {profile.name} 헌터
                </h1>
                <span
                  className="inline-flex mt-2 text-xs font-bold"
                  style={{ borderRadius: 999, padding: '3px 11px', ...(GRADE_STYLE[profile.grade] ?? {}) }}
                >
                  {profile.grade ?? '루키'}
                </span>
              </div>

              {/* 등급 스토리 */}
              <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                {profile.gradeStory}
              </p>

              {/* 스탯 */}
              <div
                className="grid grid-cols-2 gap-px"
                style={{ borderRadius: 12, border: '1px solid var(--hair-2)', overflow: 'hidden', background: 'var(--hair-2)' }}
              >
                <StatCell label="완료" value={`${profile.completionCount ?? 0}건`} />
                <StatCell label="평점" value={
                  <span className="flex items-center justify-center gap-1">
                    <StarRating rating={profile.averageRating} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                      {Number(profile.averageRating ?? 0).toFixed(1)}
                    </span>
                  </span>
                } />
              </div>

              {/* 찜하기 */}
              {isUser && (
                <button
                  type="button"
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                  style={{
                    height: 44, borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: bookmarkMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: bookmarkMutation.isPending ? 0.6 : 1,
                    border: profile.isBookmarked ? '1px solid rgba(229,87,58,.4)' : '1px solid var(--hair)',
                    background: profile.isBookmarked ? 'rgba(229,87,58,.07)' : '#fff',
                    color: profile.isBookmarked ? 'var(--accent)' : 'var(--ink-2)',
                  }}
                >
                  {bookmarkMutation.isPending ? '처리 중...' : profile.isBookmarked ? '♥ 찜 취소' : '♡ 찜하기'}
                </button>
              )}

              <Link
                to="/hunter"
                style={{ display: 'inline-flex', height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '1px solid var(--hair)', background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'none' }}
              >
                ← 목록으로
              </Link>
            </div>
          </aside>

          {/* 오른쪽 — 리뷰 목록 */}
          <section className="flex flex-col gap-5">
            <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair-2)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                받은 리뷰 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-2)' }}>({reviewData?.totalElements ?? 0}개)</span>
              </h2>
            </div>

            {reviews.length === 0 && (
              <p className="py-16 text-center text-sm" style={{ color: 'var(--ink-2)' }}>아직 받은 리뷰가 없습니다.</p>
            )}

            {reviews.map((review) => (
              <div
                key={review.reviewId}
                style={{ borderRadius: 14, border: '1px solid var(--hair-2)', background: '#fff', padding: '18px 20px' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs" style={{ color: 'var(--ink-2)' }}>
                      {review.userName} · {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.requestTitle && (
                    <span
                      className="text-xs shrink-0 max-w-[160px] truncate"
                      style={{ borderRadius: 999, border: '1px solid var(--hair-2)', padding: '2px 9px', color: 'var(--ink-2)' }}
                      title={review.requestTitle}
                    >
                      {review.requestTitle}
                    </span>
                  )}
                </div>
                {review.content && (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{review.content}</p>
                )}
              </div>
            ))}

            {/* 리뷰 페이지네이션 */}
            {totalReviewPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <PageBtn disabled={reviewPage <= 0} onClick={() => setReviewPage((p) => p - 1)}>＜</PageBtn>
                {Array.from({ length: totalReviewPages }, (_, i) => (
                  <PageBtn key={i} active={i === reviewPage} onClick={() => setReviewPage(i)}>{i + 1}</PageBtn>
                ))}
                <PageBtn disabled={reviewPage >= totalReviewPages - 1} onClick={() => setReviewPage((p) => p + 1)}>＞</PageBtn>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCell({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3" style={{ background: '#fff' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{value}</span>
    </div>
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
