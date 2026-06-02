import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import {
  deleteRequest,
  fetchRequestDetail,
  fetchSavedRequest,
  toggleSavedRequest,
  applyRequest,
} from '../../shared/api/requestApi'
import CommentSection from './CommentSection'

const KAKAO_MAP_SDK_ID = 'kakao-map-sdk'

function formatDateTime(value) {
  if (!value) return '미입력'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '미입력'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getStatusStyle(status) {
  if (status === '대기 중') return { background: 'rgba(229,87,58,.1)', color: '#c0392b' }
  if (status === '예약 완료') return { background: 'rgba(229,165,10,.12)', color: '#7a5700' }
  if (status === '완료') return { background: 'rgba(46,140,104,.12)', color: 'var(--brand)' }
  return { background: 'rgba(232,231,227,.6)', color: 'var(--ink-2)' }
}

function loadKakaoMapSdk() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

  if (!appKey) {
    return Promise.reject(new Error('카카오 지도 키가 설정되지 않았습니다.'))
  }

  if (window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao)
  }

  const existingScript = document.getElementById(KAKAO_MAP_SDK_ID)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => {
        if (!window.kakao?.maps) {
          reject(new Error('카카오 지도 SDK를 불러오지 못했습니다.'))
          return
        }

        window.kakao.maps.load(() => resolve(window.kakao))
      }, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = KAKAO_MAP_SDK_ID
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = () => reject(new Error('카카오 지도 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })
}

function DetailMap({ location }) {
  const mapContainerRef = useRef(null)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    let cancelled = false

    if (!location || !mapContainerRef.current) {
      setMapError('위치 정보가 입력되지 않았습니다.')
      return
    }

    loadKakaoMapSdk()
      .then((kakao) => {
        if (cancelled || !mapContainerRef.current) return

        const fallbackCenter = new kakao.maps.LatLng(37.5665, 126.978)
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center: fallbackCenter,
          level: 4,
        })

        map.setDraggable(false)
        map.setZoomable(false)

        const geocoder = new kakao.maps.services.Geocoder()

        geocoder.addressSearch(location, (result, status) => {
          if (cancelled) return

          if (status !== kakao.maps.services.Status.OK || result.length === 0) {
            setMapError('지도에서 위치를 찾지 못했습니다.')
            return
          }

          const coords = new kakao.maps.LatLng(result[0].y, result[0].x)
          map.setCenter(coords)
          new kakao.maps.Marker({ map, position: coords })
          setMapError('')
        })
      })
      .catch((error) => {
        if (!cancelled) setMapError(error.message)
      })

    return () => {
      cancelled = true
    }
  }, [location])

  return (
    <div style={{ borderRadius: 12, border: '1px solid var(--hair-2)', overflow: 'hidden', background: '#f5f5f0' }}>
      <div ref={mapContainerRef} className="h-64 w-full" />
      {mapError && (
        <div style={{ borderTop: '1px solid var(--hair-2)', padding: '10px 14px', fontSize: 13, color: 'var(--ink-2)' }}>
          {mapError}
        </div>
      )}
    </div>
  )
}

export default function RequestDetailPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isLoggedIn } = useAuthStore()

  const { data: request, isLoading, isError, error } = useQuery({
    queryKey: ['requestDetail', requestId],
    queryFn: () => fetchRequestDetail(requestId),
    enabled: Boolean(requestId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestList'] })
      queryClient.invalidateQueries({ queryKey: ['mypage', 'requests'] })
      navigate('/requestView/list', { replace: true })
    },
  })

  const isOwner = useMemo(() => {
    if (!isLoggedIn || !user || !request) return false
    return user.role === 'USER' && Number(user.userId) === Number(request.userId)
  }, [isLoggedIn, request, user])

  const isHunter = isLoggedIn && user?.role === 'HUNTER'

  const { data: savedRequest } = useQuery({
    queryKey: ['savedRequest', requestId],
    queryFn: () => fetchSavedRequest(requestId),
    enabled: Boolean(requestId) && isHunter,
  })

  const savedMutation = useMutation({
    mutationFn: () => toggleSavedRequest(requestId),
    onSuccess: (data) => {
      queryClient.setQueryData(['savedRequest', requestId], data)
      queryClient.invalidateQueries({ queryKey: ['mypage', 'hunter', 'bookmarks', 'requests'] })
    },
  })

  // 헌터 지원 및 1:1 대화방 개설을 위한 Mutation
  const applyMutation = useMutation({
    mutationFn: () => applyRequest(requestId),
    onSuccess: () => {
      alert('성공적으로 지원했습니다! 의뢰인과의 1:1 채팅방이 개설되었습니다. 우측 하단의 채팅 플로팅 버튼(💬)을 눌러 확인해 주세요.')
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
    },
    onError: (error) => {
      const errorMsg = error?.response?.data || error.message
      alert('지원 처리에 실패했습니다: ' + errorMsg)
    }
  })

  const handleApply = () => {
    if (applyMutation.isPending) return
    if (!window.confirm('이 의뢰에 지원하시겠습니까? 지원 시 의뢰인과의 1:1 대화방이 자동으로 개설됩니다.')) return
    applyMutation.mutate()
  }

  const handleDelete = () => {
    const confirmed = window.confirm('삭제된 게시물은 복구할 수 없습니다. 그래도 삭제하시겠습니까?')
    if (!confirmed || deleteMutation.isPending) return

    deleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ borderRadius: 14, border: '1px solid var(--hair-2)', background: '#fff', padding: '32px 48px', fontSize: 14, color: 'var(--ink-2)' }}>
          의뢰 상세 정보를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (isError || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6" style={{ background: 'var(--bg)' }}>
        <div style={{ borderRadius: 12, background: 'rgba(229,87,58,.08)', border: '1px solid rgba(229,87,58,.18)', padding: '14px 18px', fontSize: 14, fontWeight: 500, color: 'var(--accent)', maxWidth: 480, width: '100%' }}>
          {error?.response?.data?.message || '의뢰 상세 정보를 불러오지 못했습니다.'}
        </div>
        <Link
          to="/requestView/list"
          style={{ display: 'inline-flex', height: 40, alignItems: 'center', borderRadius: 999, border: '1px solid var(--hair)', background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
        >
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const imageUrls = request.imageUrls ?? []
  const mapLocation = request.approxLocation
  const isSaved = Boolean(savedRequest?.bookmarked)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto w-full max-w-6xl px-6 py-10">

        {/* 브레드크럼 */}
        <nav className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
          <Link
            to="/requestView/list"
            className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--brand-2)', textDecoration: 'none' }}
          >
            헌터 구인
          </Link>
          <span>›</span>
          <span>상세 보기</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* 본문 카드 */}
          <section style={{ borderRadius: 18, border: '1px solid var(--hair-2)', background: '#fff', padding: '28px', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)' }}>

            {/* 헤더 */}
            <div className="flex flex-wrap items-start justify-between gap-4" style={{ borderBottom: '1px solid var(--hair-2)', paddingBottom: 20, marginBottom: 4 }}>
              <div>
                <div className="mb-3">
                  <span
                    className="inline-flex text-xs font-bold"
                    style={{ borderRadius: 999, padding: '4px 11px', ...getStatusStyle(request.status) }}
                  >
                    {request.status || '상태 없음'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--ink)', letterSpacing: '-0.025em' }}>
                  {request.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center text-sm"
                      style={{ borderRadius: 999, background: 'rgba(46,140,104,.1)' }}
                    >
                      🐛
                    </div>
                    <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{request.nickname || '의뢰인'}</strong>
                  </div>

                  <MetaDot />
                  <MetaItem label="위치" value={request.approxLocation || '미입력'} />
                  <MetaDot />
                  <MetaItem label="조회수" value={`${request.viewCount ?? 0}회`} />
                  <MetaDot />
                  <MetaItem label="발생 시간" value={formatDateTime(request.occurrenceTime)} />
                </div>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex flex-col gap-7 py-6">

              {/* 상세 내용 */}
              <div>
                <h2 className="mb-3 text-base font-bold" style={{ color: 'var(--ink)' }}>상세 내용</h2>
                <div
                  className="min-h-36 whitespace-pre-wrap text-sm leading-7"
                  style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fafaf8', padding: '16px', color: 'var(--ink)' }}
                >
                  {request.content || request.description || '등록된 내용이 없습니다.'}
                </div>
              </div>

              {/* 첨부 미디어 */}
              {(imageUrls.length > 0 || request.videoUrl) && (
                <div className="flex flex-col gap-4">
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imageUrls.map((imageUrl) => (
                        <a
                          key={imageUrl}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-fit max-w-[240px] overflow-hidden"
                          style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fafaf8' }}
                        >
                          <img src={imageUrl} alt="의뢰 첨부 이미지" className="max-h-48 max-w-full object-contain" />
                        </a>
                      ))}
                    </div>
                  )}
                  {request.videoUrl && (
                    <video
                      src={request.videoUrl}
                      controls
                      className="max-h-72 w-full object-contain bg-black"
                      style={{ borderRadius: 12, border: '1px solid var(--hair-2)' }}
                    />
                  )}
                </div>
              )}

              {/* 정보 테이블 */}
              <section style={{ borderRadius: 12, border: '1px solid var(--hair-2)', overflow: 'hidden' }}>
                <InfoItem label="대략적인 위치" value={request.approxLocation} />
                <InfoItem label="발생 시간" value={formatDateTime(request.occurrenceTime)} />
                <InfoItem label="추가 정보" value={request.description} />
              </section>

              {/* 액션 버튼 구역 */}
              <div className="flex flex-wrap justify-start gap-3" style={{ borderTop: '1px solid var(--hair-2)', paddingTop: 20 }}>
                <Link
                  to="/requestView/list"
                  style={{ display: 'inline-flex', height: 40, alignItems: 'center', borderRadius: 999, border: '1px solid var(--hair)', background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
                >
                  ← 목록으로
                </Link>

                {isHunter && (
                  <>
                    <button
                      type="button"
                      onClick={() => savedMutation.mutate()}
                      disabled={savedMutation.isPending}
                      style={{
                        display: 'inline-flex', height: 40, alignItems: 'center',
                        borderRadius: 999, padding: '0 18px', fontSize: 13, fontWeight: 600,
                        cursor: savedMutation.isPending ? 'not-allowed' : 'pointer',
                        opacity: savedMutation.isPending ? 0.6 : 1,
                        border: isSaved ? '1px solid rgba(229,87,58,.4)' : '1px solid rgba(229,87,58,.3)',
                        background: isSaved ? 'rgba(229,87,58,.08)' : '#fff',
                        color: 'var(--accent)',
                      }}
                    >
                      {savedMutation.isPending ? '처리 중' : isSaved ? '♥ 찜 취소' : '♡ 찜하기'}
                    </button>

                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                      className="inline-flex h-10 w-36 items-center justify-center rounded-full bg-green-900 px-4 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {applyMutation.isPending ? '지원 중...' : '⚡ 헌터 지원하기'}
                    </button>
                  </>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/requestView/edit/${request.requestId}`}
                      style={{ display: 'inline-flex', height: 40, alignItems: 'center', borderRadius: 999, border: '1px solid var(--brand-2)', background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--brand-2)', textDecoration: 'none' }}
                    >
                      수정하기
                    </Link>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      style={{
                        display: 'inline-flex', height: 40, alignItems: 'center',
                        borderRadius: 999, border: '1px solid rgba(229,87,58,.35)',
                        background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600,
                        color: 'var(--accent)', cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                        opacity: deleteMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      {deleteMutation.isPending ? '삭제 중' : '삭제하기'}
                    </button>
                  </>
                )}
              </div>

              {deleteMutation.isError && (
                <p className="text-right text-sm" style={{ color: 'var(--accent)' }}>
                  {deleteMutation.error?.response?.data?.message || '의뢰 삭제에 실패했습니다.'}
                </p>
              )}

              {savedMutation.isError && (
                <p className="text-right text-sm" style={{ color: 'var(--accent)' }}>
                  {savedMutation.error?.response?.data?.message || '찜 처리에 실패했습니다.'}
                </p>
              )}

              <CommentSection requestId={requestId} />
            </div>
          </section>

          {/* 사이드바 */}
          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <section style={{ borderRadius: 18, border: '1px solid var(--hair-2)', background: '#fff', padding: '22px', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)' }}>
              <h2 className="mb-3 text-base font-bold" style={{ color: 'var(--ink)' }}>대략적인 위치</h2>
              <DetailMap location={mapLocation} />
              <p className="mt-3 text-sm leading-6" style={{ color: 'var(--ink-2)' }}>
                {mapLocation || '위치 정보가 없습니다.'}
              </p>
              <p className="mt-2 text-xs leading-5" style={{ color: 'var(--muted)' }}>
                정확한 주소는 매칭된 헌터에게만 공개됩니다.
              </p>
            </section>
          </aside>

        </div>
      </div>
    </div>
  )
}

function MetaDot() {
  return <span style={{ color: 'var(--hair)', userSelect: 'none' }}>·</span>
}

function MetaItem({ label, value }) {
  return (
    <span className="flex items-baseline gap-1">
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.02em' }}>{label}</span>
      <span>{value}</span>
    </span>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="grid md:grid-cols-[150px_minmax(0,1fr)]" style={{ borderBottom: '1px solid var(--hair-2)' }}>
      <div style={{ background: '#fafaf8', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}
        className="last:border-b-0"
      >
        {label}
      </div>
      <div style={{ padding: '12px 16px', fontSize: 13, lineHeight: 1.65, color: 'var(--ink)' }}>
        {value || '미입력'}
      </div>
    </div>
  )
}