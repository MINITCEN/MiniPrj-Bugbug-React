import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import {
  createRequest,
  fetchRequestEditForm,
  updateRequest,
} from '../../shared/api/requestApi'

const STATUS_STYLE = {
  '대기 중':  { background: 'rgba(229,87,58,.1)',   color: '#c0392b',        border: '1px solid rgba(229,87,58,.3)' },
  '예약 완료': { background: 'rgba(229,165,10,.12)', color: '#7a5700',        border: '1px solid rgba(229,165,10,.35)' },
  '완료':     { background: 'rgba(46,140,104,.12)',  color: 'var(--brand)',   border: '1px solid rgba(46,140,104,.3)' },
}

const INITIAL_FORM = {
  title: '',
  location: '',
  content: `1. 벌레 종류 :
2. 벌레 크기 :
3. 발생 위치 :
4. 벌레 개체 수 :`,
  description: '',
  occurrenceTime: '',
  status: '대기 중',
  detailLocation: '',
}

const KAKAO_MAP_SDK_ID = 'kakao-map-sdk'
const DEFAULT_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
}

function loadKakaoMapSdk() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

  if (!appKey) {
    return Promise.reject(new Error('카카오맵 API 키가 설정되지 않았습니다.'))
  }

  if (window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao)
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_MAP_SDK_ID)

    const loadMap = () => {
      if (!window.kakao?.maps) {
        reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
        return
      }

      window.kakao.maps.load(() => resolve(window.kakao))
    }

    if (existingScript) {
      existingScript.addEventListener('load', loadMap, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('카카오맵 SDK 로드에 실패했습니다.')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAP_SDK_ID
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.async = true
    script.onload = loadMap
    script.onerror = () => reject(new Error('카카오맵 SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (typeof data === 'string') return data
  if (data?.message) return data.message
  return '의뢰 저장에 실패했습니다. 입력 내용을 확인해 주세요.'
}

function formatDateTimeLocal(value) {
  if (!value) return ''
  return value.slice(0, 16)
}

/* ─── 미리보기 컴포넌트 ───────────────────────────────── */

function ImagePreview({ item, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden" style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fff' }}>
      <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white transition-opacity hover:opacity-100"
        style={{ opacity: 0.9 }}
        aria-label={`${item.file.name} 이미지 삭제`}
      >
        ×
      </button>
      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white">
        <span className="block truncate">{item.file.name}</span>
      </div>
    </div>
  )
}

function VideoPreview({ item, onRemove }) {
  return (
    <div className="relative overflow-hidden" style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fff' }}>
      <video src={item.url} controls className="aspect-video w-full bg-black object-contain" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white transition-opacity hover:opacity-100"
        style={{ opacity: 0.9 }}
        aria-label={`${item.file.name} 동영상 삭제`}
      >
        ×
      </button>
      <div className="px-3 py-2 text-xs" style={{ color: 'var(--ink-2)' }}>
        <span className="block truncate">{item.file.name}</span>
      </div>
    </div>
  )
}

function ExistingImagePreview({ imageUrl, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden" style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fff' }}>
      <img src={imageUrl} alt="기존 첨부 이미지" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white transition-opacity hover:opacity-100"
        style={{ opacity: 0.9 }}
        aria-label="기존 이미지 삭제"
      >
        ×
      </button>
    </div>
  )
}

function ExistingVideoPreview({ videoUrl, onRemove }) {
  return (
    <div className="relative overflow-hidden" style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fff' }}>
      <video src={videoUrl} controls className="aspect-video w-full bg-black object-contain" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white transition-opacity hover:opacity-100"
        style={{ opacity: 0.9 }}
        aria-label="기존 동영상 삭제"
      >
        ×
      </button>
      <div className="px-3 py-2 text-xs" style={{ color: 'var(--ink-2)' }}>기존 첨부 동영상</div>
    </div>
  )
}

/* ─── 페이지 진입점 ──────────────────────────────────── */

export default function RequestFormPage() {
  const { requestId } = useParams()
  const isEditMode = Boolean(requestId)

  const { data: editForm, isLoading: isEditLoading, isError: isEditError, error: editError } = useQuery({
    queryKey: ['requestEditForm', requestId],
    queryFn: () => fetchRequestEditForm(requestId),
    enabled: isEditMode,
  })

  if (isEditMode && isEditLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: 'var(--bg)', color: 'var(--ink-2)' }}>
        의뢰 수정 정보를 불러오는 중입니다.
      </div>
    )
  }

  if (isEditMode && (isEditError || !editForm)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6" style={{ background: 'var(--bg)' }}>
        <div style={{ borderRadius: 12, background: 'rgba(229,87,58,.08)', border: '1px solid rgba(229,87,58,.2)', padding: '14px 18px', fontSize: 14, fontWeight: 500, color: 'var(--accent)', maxWidth: 480, width: '100%' }}>
          {editError?.response?.data?.message || '의뢰 수정 정보를 불러오지 못했습니다.'}
        </div>
        <Link
          to="/requestView/list"
          style={{ display: 'inline-flex', height: 40, alignItems: 'center', borderRadius: 999, border: '1px solid var(--hair)', background: '#fff', padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
        >
          목록으로
        </Link>
      </div>
    )
  }

  return (
    <RequestFormContent
      key={requestId ?? 'new'}
      requestId={requestId}
      isEditMode={isEditMode}
      editForm={editForm}
    />
  )
}

function getInitialForm(editForm) {
  if (!editForm) return INITIAL_FORM

  const nextForm = editForm.form ?? {}
  return {
    title: nextForm.title ?? '',
    location: nextForm.location ?? '',
    detailLocation: nextForm.detailLocation ?? '',
    content: nextForm.content ?? '',
    description: nextForm.description ?? '',
    occurrenceTime: formatDateTimeLocal(nextForm.occurrenceTime),
    status: nextForm.status ?? '대기 중',
  }
}

/* ─── 폼 본체 ────────────────────────────────────────── */

function RequestFormContent({ requestId, isEditMode, editForm }) {
  const [form, setForm] = useState(() => getInitialForm(editForm))
  const [imageFiles, setImageFiles] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [existingImageUrls, setExistingImageUrls] = useState(() => editForm?.mediaUrl?.imageUrls ?? [])
  const [existingVideoUrl, setExistingVideoUrl] = useState(() => editForm?.mediaUrl?.videoUrl ?? '')
  const [deletedImageUrls, setDeletedImageUrls] = useState([])
  const [deletedVideoUrl, setDeletedVideoUrl] = useState('')
  const [error, setError] = useState('')
  const [mapError, setMapError] = useState('')
  const [dragCounter, setDragCounter] = useState(0)
  const [placeResults, setPlaceResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(() => (
    editForm?.form?.location ? { address: editForm.form.location } : null
  ))
  const [placeResults, setPlaceResults] = useState([])
  const { user, isLoggedIn, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const imageFilesRef = useRef(imageFiles)
  const videoFileRef = useRef(videoFile)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const geocoderRef = useRef(null)
  const placesRef = useRef(null)
  const placesRef = useRef(null)

  useEffect(() => {
    imageFilesRef.current = imageFiles
    videoFileRef.current = videoFile
  }, [imageFiles, videoFile])

  useEffect(() => () => {
    imageFilesRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    if (videoFileRef.current) {
      URL.revokeObjectURL(videoFileRef.current.url)
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (user?.role !== 'USER') {
      navigate('/requestView/list')
    }
  }, [isLoading, isLoggedIn, navigate, user?.role])

  useEffect(() => {
    let isCancelled = false

    loadKakaoMapSdk()
      .then((kakao) => {
        if (isCancelled || !mapContainerRef.current) return

        const center = new kakao.maps.LatLng(
          DEFAULT_MAP_CENTER.latitude,
          DEFAULT_MAP_CENTER.longitude,
        )

        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 5,
        })
        geocoderRef.current = new kakao.maps.services.Geocoder()
        placesRef.current = new kakao.maps.services.Places()
        setMapError('')
      })
      .catch((sdkError) => {
        if (!isCancelled) {
          setMapError(sdkError.message)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: createRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requestList'] })
      navigate('/requestView/list')
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (formData) => updateRequest(requestId, formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['requestDetail', requestId] }),
        queryClient.invalidateQueries({ queryKey: ['requestEditForm', requestId] }),
        queryClient.invalidateQueries({ queryKey: ['requestList'] }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'requests'] }),
      ])
      navigate(`/requestView/detail/${requestId}`)
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError))
    },
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'location') {
      setPlaceResults([])
      setSelectedLocation(null)
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }
  }

  const updateSelectedMapLocation = ({ latitude, longitude, address }) => {
    const position = new window.kakao.maps.LatLng(latitude, longitude)

    mapRef.current.setCenter(position)

    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    markerRef.current = new window.kakao.maps.Marker({
      map: mapRef.current,
      position,
    })

    setForm((current) => ({
      ...current,
      location: address,
    }))

    setSelectedLocation({
      address,
      latitude,
      longitude,
    })
    setPlaceResults([])
    setMapError('')
  }

  const handleSearchLocation = () => {
    const keyword = form.location.trim()

    if (!keyword) {
      setMapError('대략적인 위치를 먼저 입력해 주세요.')
      return
    }

    if (!window.kakao?.maps || !mapRef.current || !geocoderRef.current || !placesRef.current) {
      setMapError('지도가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    placesRef.current.keywordSearch(keyword, (placeResult, placeStatus) => {
      if (placeStatus === window.kakao.maps.services.Status.OK && placeResult.length > 0) {
        setPlaceResults(placeResult.slice(0, 5))
        setMapError('')
        return
      }

      geocoderRef.current.addressSearch(keyword, (addressResult, addressStatus) => {
        if (addressStatus !== window.kakao.maps.services.Status.OK || addressResult.length === 0) {
          setSelectedLocation(null)
          setPlaceResults([])
          setMapError('입력한 위치를 찾지 못했습니다. 예: 강남역, 서울 강남구 역삼동')
          return
        }

        const firstResult = addressResult[0]
        updateSelectedMapLocation({
          latitude: Number(firstResult.y),
          longitude: Number(firstResult.x),
          address: firstResult.address_name,
        })
      })
    })
  }

  const handleSelectPlace = (place) => {
    updateSelectedMapLocation({
      latitude: Number(place.y),
      longitude: Number(place.x),
      address: place.road_address_name || place.address_name || place.place_name,
    })
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    const validFiles = files.filter((file) => file.type.startsWith('image/'))

    if (validFiles.length !== files.length) {
      setError('이미지 파일만 첨부할 수 있습니다.')
    }

    const nextItems = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }))

    setImageFiles((current) => [...current, ...nextItems])
    event.target.value = ''
  }

  const handleVideoChange = (event) => {
    if (existingVideoUrl) {
      event.target.value = ''
      setError('기존 동영상을 삭제한 후 새 동영상을 등록해 주세요.')
      return
    }

    if (videoFile) {
      event.target.value = ''
      setError('동영상은 1개만 첨부할 수 있습니다. 기존 동영상을 삭제한 후 다시 선택해 주세요.')
      return
    }

    const file = event.target.files?.[0] ?? null

    if (file && !file.type.startsWith('video/')) {
      event.target.value = ''
      setVideoFile(null)
      setError('동영상 파일만 첨부할 수 있습니다.')
      return
    }

    setVideoFile((current) => {
      if (current) {
        URL.revokeObjectURL(current.url)
      }

      return file
        ? {
            file,
            url: URL.createObjectURL(file),
          }
        : null
    })
    event.target.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setDragCounter((c) => c + 1)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragCounter((c) => Math.max(0, c - 1))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragCounter(0)
    setError('')

    const files = Array.from(e.dataTransfer.files)
    const droppedImages = files.filter((f) => f.type.startsWith('image/'))
    const droppedVideos = files.filter((f) => f.type.startsWith('video/'))

    if (droppedImages.length > 0) {
      const nextItems = droppedImages.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }))
      setImageFiles((current) => [...current, ...nextItems])
    }

    if (droppedVideos.length > 0) {
      if (hasVideoSlot) {
        setError('동영상은 1개만 첨부할 수 있습니다. 기존 동영상을 삭제한 후 다시 시도해 주세요.')
      } else {
        const file = droppedVideos[0]
        setVideoFile({ file, url: URL.createObjectURL(file) })
      }
    }

    const unknownFiles = files.filter((f) => !f.type.startsWith('image/') && !f.type.startsWith('video/'))
    if (unknownFiles.length > 0 && droppedImages.length === 0 && droppedVideos.length === 0) {
      setError('이미지 또는 동영상 파일만 첨부할 수 있습니다.')
    }
  }

  const removeImageFile = (removeIndex) => {
    setImageFiles((current) => {
      const target = current[removeIndex]
      if (target) {
        URL.revokeObjectURL(target.url)
      }

      return current.filter((_, index) => index !== removeIndex)
    })
  }

  const removeVideoFile = () => {
    setVideoFile((current) => {
      if (current) {
        URL.revokeObjectURL(current.url)
      }

      return null
    })
  }

  const removeExistingImage = (imageUrl) => {
    setExistingImageUrls((current) => current.filter((url) => url !== imageUrl))
    setDeletedImageUrls((current) => (
      current.includes(imageUrl) ? current : [...current, imageUrl]
    ))
  }

  const removeExistingVideo = () => {
    if (!existingVideoUrl) return

    setDeletedVideoUrl(existingVideoUrl)
    setExistingVideoUrl('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!selectedLocation) {
      setMapError('대략적인 위치를 검색하고 지도에 핀을 표시해 주세요.')
      return
    }

    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('location', form.location.trim())
    formData.append('detailLocation', form.detailLocation?.trim() ?? '')
    formData.append('content', form.content.trim())
    formData.append('description', form.description.trim())
    formData.append('status', isEditMode ? form.status : '대기 중')

    if (form.occurrenceTime) {
      formData.append('occurrenceTime', form.occurrenceTime)
    }

    deletedImageUrls.forEach((imageUrl) => {
      formData.append('imageUrls', imageUrl)
    })

    if (deletedVideoUrl) {
      formData.append('videoUrl', deletedVideoUrl)
    }

    imageFiles.forEach((item) => {
      formData.append('imageFiles', item.file)
    })

    if (videoFile) {
      formData.append('videoFile', videoFile.file)
    }

    if (isEditMode) {
      updateMutation.mutate(formData)
      return
    }

    createMutation.mutate(formData)
  }

  const handleReset = () => {
    imageFiles.forEach((item) => URL.revokeObjectURL(item.url))
    if (videoFile) {
      URL.revokeObjectURL(videoFile.url)
    }

    if (isEditMode && editForm) {
      const nextForm = editForm.form ?? {}
      setForm({
        title: nextForm.title ?? '',
        location: nextForm.location ?? '',
        detailLocation: nextForm.detailLocation ?? '',
        content: nextForm.content ?? '',
        description: nextForm.description ?? '',
        occurrenceTime: formatDateTimeLocal(nextForm.occurrenceTime),
        status: nextForm.status ?? '대기 중',
      })
      setExistingImageUrls(editForm.mediaUrl?.imageUrls ?? [])
      setExistingVideoUrl(editForm.mediaUrl?.videoUrl ?? '')
      setDeletedImageUrls([])
      setDeletedVideoUrl('')
      setSelectedLocation(nextForm.location ? { address: nextForm.location } : null)
    } else {
      setForm(INITIAL_FORM)
      setSelectedLocation(null)
    }

    setImageFiles([])
    setVideoFile(null)
    setMapError('')
    if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
    }
    setError('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: 'var(--bg)', color: 'var(--ink-2)' }}>
        사용자 정보를 확인하는 중입니다.
      </div>
    )
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const hasExistingMedia = existingImageUrls.length > 0 || Boolean(existingVideoUrl)
  const hasNewMedia = imageFiles.length > 0 || Boolean(videoFile)
  const hasVideoSlot = Boolean(videoFile || existingVideoUrl)
  const isDragging = dragCounter > 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">

        {/* 페이지 제목 */}
        <section>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            {isEditMode ? '의뢰 수정하기' : '의뢰 등록하기'}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-2)' }}>
            {isEditMode
              ? '기존 의뢰 내용을 수정해주세요.'
              : '헌터에게 요청할 해충 퇴치 의뢰 내용을 자세히 작성해주세요.'}
          </p>
        </section>

        {/* 폼 카드 */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 18,
            border: '1px solid var(--hair-2)',
            boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 2px 12px -4px rgba(29,58,46,.04)',
            padding: '32px 36px',
          }}
        >
          <div className="flex flex-col gap-8">

            {/* 오류 메시지 */}
            {error && (
              <div style={{ borderRadius: 12, background: 'rgba(229,87,58,.08)', border: '1px solid rgba(229,87,58,.18)', padding: '12px 16px', fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>
                {error}
              </div>
            )}

            {/* ── 섹션 1: 의뢰 정보 ── */}
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between" style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair-2)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>의뢰 정보 입력</h2>

                {isEditMode && (
                  <label className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink-2)' }}>진행 상태</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      style={{
                        height: 36, borderRadius: 999, padding: '0 14px',
                        fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer',
                        ...(STATUS_STYLE[form.status] ?? { background: '#fff', color: 'var(--ink)', border: '1px solid var(--hair)' }),
                      }}
                    >
                      <option value="대기 중">대기 중</option>
                      <option value="예약 완료">예약 완료</option>
                      <option value="완료">완료</option>
                    </select>
                  </label>
                )}
              </div>

              {/* 제목 */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  제목 <b style={{ color: 'var(--brand-2)' }}>*</b>
                </span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="예: 주방에 바퀴벌레가 나타났어요!"
                  style={{ height: 48, borderRadius: 10, border: '1px solid var(--hair)', padding: '0 16px', fontSize: 14, outline: 'none', width: '100%' }}
                />
              </label>

              {/* 위치 */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  대략적인 위치 <b style={{ color: 'var(--brand-2)' }}>*</b>
                </span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="예: 강남역, 서울 강남구 역삼동"
                    style={{ height: 48, borderRadius: 10, border: '1px solid var(--hair)', padding: '0 16px', fontSize: 14, flex: 1, outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    style={{
                      height: 48, borderRadius: 999, border: '1px solid var(--hair)',
                      background: '#fff', padding: '0 22px',
                      fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    위치 검색
                  </button>
                </div>
              </label>

              {/* 키워드 검색 결과 드롭다운 */}
              {placeResults.length > 0 && (
                <div style={{ borderRadius: 12, border: '1px solid var(--hair-2)', background: '#fff', overflow: 'hidden' }}>
                  {placeResults.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      style={{ display: 'block', width: '100%', borderBottom: '1px solid var(--hair-2)', padding: '10px 16px', textAlign: 'left', background: 'none', cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafaf8' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                    >
                      <strong style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{place.place_name}</strong>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--ink-2)' }}>
                        {place.road_address_name || place.address_name || '주소 정보 없음'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 지도 */}
              <div className="flex flex-col gap-1.5">
                <div
                  ref={mapContainerRef}
                  style={{ height: 280, borderRadius: 12, border: '1px solid var(--hair-2)', background: '#f5f5f0', overflow: 'hidden' }}
                />
                <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0 }}>
                  {selectedLocation
                    ? `선택 위치: ${selectedLocation.address}`
                    : '위치를 검색하면 지도에 핀이 표시됩니다.'}
                </p>
                {mapError && (
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', margin: 0 }}>{mapError}</p>
                )}
              </div>

              {/* 상세 내용 */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  상세 내용 <b style={{ color: 'var(--brand-2)' }}>*</b>
                </span>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={8}
                  style={{
                    borderRadius: 10, border: '1px solid var(--hair)',
                    padding: '12px 16px', fontSize: 14, lineHeight: 1.65,
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit', width: '100%',
                  }}
                />
              </label>

              {/* 추가 요청 사항 / 발생 시간 */}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>추가 요청 사항</span>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="필요하면 요청 사항을 입력하세요."
                    style={{ height: 48, borderRadius: 10, border: '1px solid var(--hair)', padding: '0 16px', fontSize: 14, outline: 'none' }}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>발생 시간</span>
                  <input
                    type="datetime-local"
                    name="occurrenceTime"
                    value={form.occurrenceTime}
                    onChange={handleChange}
                    style={{ height: 48, borderRadius: 10, border: '1px solid var(--hair)', padding: '0 16px', fontSize: 14, outline: 'none' }}
                  />
                </label>
              </div>
            </section>

            {/* ── 섹션 2: 첨부 파일 ── */}
            <section className="flex flex-col gap-3">
              <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair-2)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>첨부 파일</h2>
              </div>

              {/* 통합 업로드 영역 */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  borderRadius: 14,
                  border: isDragging ? '1.5px dashed var(--brand-2)' : '1px dashed var(--hair)',
                  background: isDragging ? 'rgba(46,140,104,.06)' : '#fafaf8',
                  padding: '16px',
                  transition: 'border-color .15s, background .15s',
                }}
              >

                {/* 버튼 툴바 */}
                <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: hasExistingMedia || hasNewMedia ? 14 : 0 }}>
                  <label style={{
                    display: 'inline-flex', height: 32, alignItems: 'center', gap: 5,
                    borderRadius: 999, border: '1px solid var(--hair)', background: '#fff',
                    padding: '0 14px', fontSize: 12, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer',
                  }}>
                    <span>＋ 이미지</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>

                  <label style={{
                    display: 'inline-flex', height: 32, alignItems: 'center', gap: 5,
                    borderRadius: 999, border: '1px solid var(--hair)', background: '#fff',
                    padding: '0 14px', fontSize: 12, fontWeight: 600,
                    color: hasVideoSlot ? 'var(--muted)' : 'var(--ink)',
                    cursor: hasVideoSlot ? 'not-allowed' : 'pointer',
                    opacity: hasVideoSlot ? 0.5 : 1,
                  }}>
                    <span>＋ 동영상</span>
                    <input type="file" accept="video/*" onChange={handleVideoChange} disabled={hasVideoSlot} className="hidden" />
                  </label>

                  {hasVideoSlot && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>동영상은 1개만 첨부됩니다</span>
                  )}
                </div>

                {/* 미디어 그리드 — 기존/신규 구분 없이 통합 표시 */}
                {(hasExistingMedia || hasNewMedia) ? (
                  <>
                    {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {existingImageUrls.map((url) => (
                          <ExistingImagePreview key={url} imageUrl={url} onRemove={() => removeExistingImage(url)} />
                        ))}
                        {imageFiles.map((item, index) => (
                          <ImagePreview key={item.id} item={item} onRemove={() => removeImageFile(index)} />
                        ))}
                      </div>
                    )}

                    {(existingVideoUrl || videoFile) && (
                      <div className={`max-w-sm ${existingImageUrls.length > 0 || imageFiles.length > 0 ? 'mt-3' : ''}`}>
                        {existingVideoUrl && <ExistingVideoPreview videoUrl={existingVideoUrl} onRemove={removeExistingVideo} />}
                        {videoFile && <VideoPreview item={videoFile} onRemove={removeVideoFile} />}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: isDragging ? 'var(--brand-2)' : 'var(--muted)', textAlign: 'center', padding: '20px 0', margin: 0, transition: 'color .15s' }}>
                    {isDragging ? '여기에 놓으세요' : '이미지와 동영상을 끌어다 놓거나 버튼으로 추가하세요'}
                  </p>
                )}
              </div>
            </section>

            {/* 작성 안내 */}
            <div style={{
              borderRadius: 12, background: 'rgba(232,231,227,.55)',
              padding: '14px 18px', fontSize: 13, lineHeight: 1.75, color: 'var(--ink-2)',
            }}>
              <strong style={{ color: 'var(--ink)' }}>작성 안내</strong><br />
              허위 의뢰나 악성 글은 관리자에 의해 삭제될 수 있습니다.<br />
              {isEditMode ? (
                <>완료 상태로 변경하려면 예약 완료된 헌터가 있어야 합니다.</>
              ) : (
                <>등록 시 상태는 기본적으로 <strong style={{ color: 'var(--ink)' }}>대기 중</strong> 상태로 저장됩니다.</>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-wrap justify-end gap-3">
              <Link
                to="/requestView/list"
                style={{
                  display: 'inline-flex', height: 44, alignItems: 'center',
                  borderRadius: 999, border: '1px solid var(--hair)',
                  background: '#fff', padding: '0 20px',
                  fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                목록으로
              </Link>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  height: 44, borderRadius: 999, border: '1px solid var(--hair)',
                  background: '#fff', padding: '0 20px',
                  fontSize: 13, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                다시 작성
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  height: 44, borderRadius: 999, border: 'none',
                  background: 'var(--ink)', padding: '0 26px',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.55 : 1,
                  transition: 'opacity .15s',
                }}
              >
                {isSaving ? '저장 중...' : isEditMode ? '의뢰 수정' : '의뢰 등록'}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  )
}
