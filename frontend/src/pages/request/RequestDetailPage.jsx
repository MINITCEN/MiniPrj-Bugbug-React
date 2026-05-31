import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import { deleteRequest, fetchRequestDetail } from '../../shared/api/requestApi'

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

function getStatusClass(status) {
  if (status === '대기 중') return 'bg-red-50 text-red-600 ring-red-100'
  if (status === '예약 완료') return 'bg-yellow-50 text-yellow-700 ring-yellow-100'
  if (status === '완료') return 'bg-green-50 text-green-700 ring-green-100'
  return 'bg-gray-100 text-gray-600 ring-gray-200'
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
    <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
      <div ref={mapContainerRef} className="h-64 w-full" />
      {mapError && (
        <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
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

  const handleDelete = () => {
    const confirmed = window.confirm('삭제된 게시물은 복구할 수 없습니다. 그래도 삭제하시겠습니까?')
    if (!confirmed || deleteMutation.isPending) return

    deleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-gray-500">
          의뢰 상세 정보를 불러오는 중입니다.
        </div>
      </main>
    )
  }

  if (isError || !request) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-md border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error?.response?.data?.message || '의뢰 상세 정보를 불러오지 못했습니다.'}
        </div>
        <div className="mt-6 text-center">
          <Link to="/requestView/list" className="text-sm font-semibold text-green-800 hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  const imageUrls = request.imageUrls ?? []
  const mapLocation = request.approxLocation

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/requestView/list" className="font-medium text-green-800 hover:underline">
            헌터 구인
          </Link>
          <span>&gt;</span>
          <span>상세 보기</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded px-2.5 py-1 text-xs font-bold ring-1 ${getStatusClass(request.status)}`}>
                  {request.status || '상태 없음'}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight text-gray-950">{request.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-lg">
                    🐛
                  </div>
                  <div>
                    <strong className="block text-sm text-gray-900">{request.nickname || '의뢰인'}</strong>
                    <p className="text-xs text-gray-500">
                      발생 시간 {formatDateTime(request.occurrenceTime)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm text-gray-600 sm:ml-auto">
                  <span>위치 {request.approxLocation || '미입력'}</span>
                  <span>조회수 {request.viewCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 py-6">
            <div>
              <h2 className="mb-3 text-base font-bold text-gray-900">상세 내용</h2>
              <div className="min-h-36 whitespace-pre-wrap rounded-md border border-gray-100 bg-gray-50 p-4 text-sm leading-7 text-gray-800">
                {request.content || request.description || '등록된 내용이 없습니다.'}
              </div>
            </div>

            {(imageUrls.length > 0 || request.videoUrl) && (
              <div>
                <h2 className="mb-3 text-base font-bold text-gray-900">첨부 파일</h2>
                <div className="flex flex-col gap-4">
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imageUrls.map((imageUrl) => (
                        <a
                          key={imageUrl}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-fit max-w-[240px] overflow-hidden rounded-md border border-gray-200 bg-gray-100"
                        >
                          <img src={imageUrl} alt="의뢰 첨부 이미지" className="max-h-48 max-w-full object-contain" />
                        </a>
                      ))}
                    </div>
                  )}
                  {request.videoUrl && (
                    <video src={request.videoUrl} controls className="max-h-72 w-full rounded-md border border-gray-200 bg-black object-contain" />
                  )}
                </div>
              </div>
            )}

            <section className="overflow-hidden rounded-md border border-gray-200">
              <InfoItem label="대략적인 위치" value={request.approxLocation} />
              <InfoItem label="상세 위치" value={request.exactLocation || '헌터와 논의 필요'} />
              <InfoItem label="발생 시간" value={formatDateTime(request.occurrenceTime)} />
              <InfoItem label="추가 정보" value={request.description} />
            </section>
          </div>

          <div className="flex flex-wrap justify-start gap-3 border-t border-gray-200 pt-5">
            <Link
              to="/requestView/list"
              className="inline-flex h-10 w-36 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← 목록으로
            </Link>
            {isHunter && (
              <>
                <button
                  type="button"
                  onClick={() => alert('찜 기능은 준비 중입니다.')}
                  className="inline-flex h-10 w-36 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  ♡ 찜하기
                </button>

                <button
                  type="button"
                  onClick={() => alert('지원 기능은 준비 중입니다.')}
                  className="inline-flex h-10 w-36 items-center justify-center rounded-md bg-green-900 px-4 text-sm font-semibold text-white hover:bg-green-800"
                >
                  ⚡ 헌터 지원하기
                </button>
              </>
            )}
            {isOwner && (
              <>
                <Link
                  to={`/requestView/edit/${request.requestId}`}
                  className="inline-flex h-10 w-36 items-center justify-center rounded-md border border-green-300 bg-white px-4 text-sm font-semibold text-green-800 hover:bg-green-100"
                >
                  수정하기
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex h-10 w-36 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteMutation.isPending ? '삭제 중' : '삭제하기'}
                </button>
              </>
            )}
          </div>

          {deleteMutation.isError && (
            <p className="mt-4 text-right text-sm text-red-600">
              {deleteMutation.error?.response?.data?.message || '의뢰 삭제에 실패했습니다.'}
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">대략적인 위치</h2>
            <DetailMap location={mapLocation} />
            <p className="mt-3 text-sm leading-6 text-gray-600">{mapLocation || '위치 정보가 없습니다.'}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              정확한 주소는 매칭된 헌터에게만 공개됩니다.
            </p>
          </section>

          <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">의뢰 정보</h2>
            <div className="rounded-md bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">
              의뢰 상세 정보를 확인한 뒤 헌터 지원 여부를 결정할 수 있습니다.
            </div>
          </section>
        </aside>
        </div>
      </div>
    </main>
  )
}

function InfoItem({ label, value }) {
    return (
      <div className="grid border-b border-gray-200 last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)]">
        <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
          {label}
        </div>
        <div className="px-4 py-3 text-sm leading-6 text-gray-900">
          {value || '미입력'}
        </div>
      </div>
    )
  }
