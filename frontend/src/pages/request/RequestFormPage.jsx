import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../../features/auth/store/useAuthStore'
import {
  createRequest,
  fetchRequestEditForm,
  updateRequest,
} from '../../shared/api/requestApi'

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

function ImagePreview({ item, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
      <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-90 transition-opacity hover:opacity-100"
        aria-label={`${item.file.name} 이미지 삭제`}
      >
        x
      </button>
      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white">
        <span className="block truncate">{item.file.name}</span>
      </div>
    </div>
  )
}

function VideoPreview({ item, onRemove }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
      <video src={item.url} controls className="aspect-video w-full bg-black object-contain" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-90 transition-opacity hover:opacity-100"
        aria-label={`${item.file.name} 동영상 삭제`}
      >
        x
      </button>
      <div className="px-3 py-2 text-xs text-gray-600">
        <span className="block truncate">{item.file.name}</span>
      </div>
    </div>
  )
}

function ExistingImagePreview({ imageUrl, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white">
      <img src={imageUrl} alt="기존 첨부 이미지" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-90 transition-opacity hover:opacity-100"
        aria-label="기존 이미지 삭제"
      >
        x
      </button>
    </div>
  )
}

function ExistingVideoPreview({ videoUrl, onRemove }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
      <video src={videoUrl} controls className="aspect-video w-full bg-black object-contain" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-90 transition-opacity hover:opacity-100"
        aria-label="기존 동영상 삭제"
      >
        x
      </button>
      <div className="px-3 py-2 text-xs text-gray-600">기존 첨부 동영상</div>
    </div>
  )
}

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
      <div className="min-h-[60vh] bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
        의뢰 수정 정보를 불러오는 중입니다.
      </div>
    )
  }

  if (isEditMode && (isEditError || !editForm)) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-6 py-16 text-center">
        <div className="mx-auto max-w-lg rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {editError?.response?.data?.message || '의뢰 수정 정보를 불러오지 못했습니다.'}
        </div>
        <Link
          to="/requestView/list"
          className="mt-5 inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
  const [selectedLocation, setSelectedLocation] = useState(() => (
    editForm?.form?.location ? { address: editForm.form.location } : null
  ))
  const { user, isLoggedIn, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const imageFilesRef = useRef(imageFiles)
  const videoFileRef = useRef(videoFile)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const geocoderRef = useRef(null)

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
  }

  const handleSearchLocation = () => {
    const keyword = form.location.trim()

    if (!keyword) {
      setMapError('대략적인 위치를 먼저 입력해 주세요.')
      return
    }

    if (!window.kakao?.maps || !mapRef.current || !geocoderRef.current) {
      setMapError('지도가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    geocoderRef.current.addressSearch(keyword, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK || result.length === 0) {
        setMapError('입력한 위치를 찾지 못했습니다. 예: 서울 강남구 역삼동')
        setSelectedLocation(null)
        return
      }

      const firstResult = result[0]
      const latitude = Number(firstResult.y)
      const longitude = Number(firstResult.x)
      const position = new window.kakao.maps.LatLng(latitude, longitude)

      mapRef.current.setCenter(position)

      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      markerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position,
      })

      setSelectedLocation({
        address: firstResult.address_name,
        latitude,
        longitude,
      })
      setMapError('')
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
      <div className="min-h-[60vh] bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
        사용자 정보를 확인하는 중입니다.
      </div>
    )
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const hasExistingMedia = existingImageUrls.length > 0 || Boolean(existingVideoUrl)
  const hasNewMedia = imageFiles.length > 0 || Boolean(videoFile)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEditMode ? '의뢰 수정하기' : '의뢰 등록하기'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isEditMode
              ? '기존 의뢰 내용을 수정해주세요.'
              : '헌터에게 요청할 해충 퇴치 의뢰 내용을 자세히 작성해주세요.'}
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-7">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-bold text-gray-900">의뢰 정보 입력</h2>

                {isEditMode && (
                  <label className="flex flex-col gap-2 md:w-48">
                    <span className="text-sm font-semibold text-gray-800">진행 상태</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-green-800"
                    >
                      <option value="대기 중">대기 중</option>
                      <option value="예약 완료">예약 완료</option>
                      <option value="완료">완료</option>
                    </select>
                  </label>
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-800">제목 <b className="text-red-500">*</b></span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-green-800"
                  placeholder="예: 주방에 바퀴벌레가 나타났어요!"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-800">대략적인 위치 <b className="text-red-500">*</b></span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-green-800"
                    placeholder="예: 서울 강남구 역삼동"
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="h-12 shrink-0 rounded-xl border border-green-900 bg-white px-5 text-sm font-semibold text-green-900 hover:bg-green-50"
                  >
                    위치 검색
                  </button>
                </div>
              </label>

              <div className="flex flex-col gap-2">
                <div
                  ref={mapContainerRef}
                  className="h-72 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                />
                <div className="min-h-5 text-xs text-gray-500">
                  {selectedLocation ? (
                    <span>
                      선택 위치: {selectedLocation.address}
                    </span>
                  ) : (
                    <span>위치를 검색하면 지도에 핀이 표시됩니다.</span>
                  )}
                </div>
                {mapError && (
                  <p className="text-xs font-medium text-red-600">{mapError}</p>
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-800">상세 내용 <b className="text-red-500">*</b></span>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed outline-none focus:border-green-800"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-800">추가 요청 사항</span>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="h-12 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-green-800"
                    placeholder="필요하면 요청 사항을 입력하세요."
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-800">발생 시간</span>
                  <input
                    type="datetime-local"
                    name="occurrenceTime"
                    value={form.occurrenceTime}
                    onChange={handleChange}
                    className="h-12 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-green-800"
                  />
                </label>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-900">첨부 파일</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 hover:border-green-800">
                  <span className="text-sm font-semibold text-gray-800">이미지 첨부</span>
                  <span className="text-xs text-gray-500">여러 장 선택할 수 있습니다.</span>
                  <span className="inline-flex h-10 w-fit items-center rounded-lg bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200">
                    이미지 선택하기
                  </span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>

                <label
                  className={
                    videoFile || existingVideoUrl
                      ? 'flex cursor-not-allowed flex-col gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-100 p-5 opacity-70'
                      : 'flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 hover:border-green-800'
                  }
                >
                  <span className="text-sm font-semibold text-gray-800">동영상 첨부</span>
                  <span className="text-xs text-gray-500">
                    {existingVideoUrl
                      ? '기존 동영상을 삭제한 후 새로 첨부할 수 있습니다.'
                      : videoFile
                        ? '이미 동영상 1개가 선택되었습니다.'
                        : '동영상은 1개만 첨부합니다.'}
                  </span>
                  <span className="inline-flex h-10 w-fit items-center rounded-lg bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200">
                    {videoFile || existingVideoUrl ? '동영상 선택 불가' : '동영상 선택하기'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    disabled={Boolean(videoFile || existingVideoUrl)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                {!hasExistingMedia && !hasNewMedia && (
                  <p className="text-gray-500">첨부한 이미지와 동영상이 여기에 표시됩니다.</p>
                )}

                {hasExistingMedia && (
                  <div className="mb-4">
                    <strong className="text-gray-800">기존 첨부 파일</strong>
                    {existingImageUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {existingImageUrls.map((imageUrl) => (
                          <ExistingImagePreview
                            key={imageUrl}
                            imageUrl={imageUrl}
                            onRemove={() => removeExistingImage(imageUrl)}
                          />
                        ))}
                      </div>
                    )}

                    {existingVideoUrl && (
                      <div className={existingImageUrls.length > 0 ? 'mt-4 max-w-xl' : 'mt-3 max-w-xl'}>
                        <ExistingVideoPreview videoUrl={existingVideoUrl} onRemove={removeExistingVideo} />
                      </div>
                    )}
                  </div>
                )}

                {hasNewMedia && (
                  <div className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                    <strong className="text-gray-800">첨부 예정 파일</strong>
                    <ul className="mt-2 flex flex-col gap-1">
                      {imageFiles.map((item) => (
                        <li key={`list-${item.id}`} className="truncate">
                          이미지: {item.file.name}
                        </li>
                      ))}
                      {videoFile && (
                        <li className="truncate">
                          동영상: {videoFile.file.name}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {hasNewMedia && (
                  <>
                  {imageFiles.length > 0 && (
                    <div>
                      <strong className="text-gray-800">이미지</strong>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {imageFiles.map((item, index) => (
                          <ImagePreview
                            key={item.id}
                            item={item}
                            onRemove={() => removeImageFile(index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {videoFile && (
                    <div className={imageFiles.length > 0 ? 'mt-4' : ''}>
                      <strong className="text-gray-800">동영상</strong>
                      <div className="mt-3 max-w-xl">
                        <VideoPreview item={videoFile} onRemove={removeVideoFile} />
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            </section>

            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              <strong>작성 안내</strong><br />
              허위 의뢰나 악성 글은 관리자에 의해 삭제될 수 있습니다.<br />
              {isEditMode ? (
                <>완료 상태로 변경하려면 예약 완료된 헌터가 있어야 합니다.</>
              ) : (
                <>등록 시 상태는 기본적으로 <strong>대기 중</strong> 상태로 저장됩니다.</>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Link
                to="/requestView/list"
                className="inline-flex h-11 items-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                목록으로
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="h-11 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                다시 작성
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 rounded-xl bg-green-900 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
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
