import { useEffect, useRef, useState, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChatMessages, uploadChatFile, confirmReservation as apiConfirmReservation } from '../../../shared/api/chatApi'
import useChatSocket from '../hooks/useChatSocket'

// ISO 8601 시간을 "오후 7:42" 형태로 가공하는 헬퍼 함수
function formatMessageTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

// ⚠️ 날짜가 변경될 때 대화방 중앙에 표시될 구분선 날짜 가공 헬퍼
function formatDividerDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export default function ChatRoomDetail({ roomId, otherNickname, initialReservedAt, userId, role, onBack, onClose }) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [reservedAt, setReservedAt] = useState(initialReservedAt)
  const [activeImageUrl, setActiveImageUrl] = useState(null) // ⚠️ 클릭하여 확대된 이미지 S3 URL 상태
  
  const scrollContainerRef = useRef(null) // ⚠️ 과거 대화 정독 시 스크롤 튕김 방지용 스크롤 컨테이너 Ref
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)          // ⚠️ 메시지 전송 후 포커스 유지를 위한 인풋 Ref

  // 이전 대화 기록 가져오기
  const { data: previousMessages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: () => fetchChatMessages(roomId),
    enabled: Boolean(roomId),
  })

  // 받아온 이전 메시지 내역 시간순 정렬 및 바인딩
  useEffect(() => {
    if (previousMessages && previousMessages.length > 0) {
      setMessages([...previousMessages].reverse())
      // ⚠️ 이전 대화 로드 시 최초 1회는 무조건 하단 강제 스크롤
      setTimeout(() => {
        scrollToBottom(true)
      }, 60)
    }
  }, [previousMessages])

  // ⚠️ 스크롤 위치에 맞춰 똑똑하게 최하단 조절하는 함수
  const scrollToBottom = (force = false) => {
    const container = scrollContainerRef.current
    if (!container) return

    // 스크롤이 맨 바닥 근처(오차범위 80px)에 있는지 체크
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80

    // 강제 스크롤이거나, 실시간 대화 도중(바닥 근처)에만 하단 이동 실행!
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // ⚠️ 실시간 메시지가 추가되었을 때 정독 여부 판정 스크롤 작동
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false)
    }
  }, [messages])

  // 웹소켓 메시지 수신 연동
  const { isConnected, sendMessage } = useChatSocket(roomId, (newMessage) => {
    setMessages((prev) => [...prev, newMessage])
  })

  // 예약 변경 뮤테이션
  const reservationMutation = useMutation({
    mutationFn: ({ localIsoString }) => apiConfirmReservation(roomId, localIsoString),
    onSuccess: (data, variables) => {
      alert('예약이 성공적으로 완료되었습니다.')
      setReservedAt(variables.localIsoString)
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
      queryClient.invalidateQueries({ queryKey: ['requestDetail'] })
    },
    onError: (error) => {
      alert('예약 처리에 실패했습니다: ' + (error?.response?.data || error.message))
    }
  })

  // 파일 업로드 뮤테이션
  const fileUploadMutation = useMutation({
    mutationFn: ({ file, messageType }) => uploadChatFile(roomId, file, messageType),
    onError: (error) => {
      alert('파일 전송 실패: ' + (error?.response?.data || error.message))
    }
  })

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(trimmed, 'TEXT')
    setInputValue('')
    // ⚠️ 메시지 전송 후 입력 포커스 즉각 자동 유지! (인풋 커서 복구)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }

  // ⚠️ 이미지 클릭하여 라이트박스 팝업 활성화 핸들러
  const handleImageClick = (url) => {
    setActiveImageUrl(url)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    let messageType = 'IMAGE'
    if (file.type.startsWith('video/')) messageType = 'VIDEO'
    if (file.type.startsWith('audio/')) messageType = 'AUDIO'

    fileUploadMutation.mutate({ file, messageType })
    e.target.value = ''
  }

  const handleReservationClick = () => {
    if (!window.confirm('이 의뢰를 예약 완료 상태로 변경하시겠습니까?')) return
    const localIsoString = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
    reservationMutation.mutate({ localIsoString })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F7F3]">
      {/* 대화방 헤더 */}
      {/* ⚠️ 럭셔리 딥 그린 그라데이션 및 벡터 SVG 아이콘 매치 */}
      <div className="bg-gradient-to-r from-[#1D3A2E] to-[#254d3d] px-5 py-4 flex items-center justify-between text-white relative select-none shadow-md z-10">
        <span onClick={onBack} className="cursor-pointer text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </span>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-[13.5px] font-black tracking-wide">{otherNickname}</span>
          {isConnected ? (
            <span className="text-[9px] text-[#2E8C68] font-bold bg-[#E8F8F5] px-1.5 py-0.2 rounded-full flex items-center gap-0.8 scale-95 shadow-sm">
              <span className="relative flex h-1.5 w-1.5 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E8C68] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2E8C68]"></span>
              </span>
              실시간 연결 완료
            </span>
          ) : (
            <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.8 scale-95 shadow-sm">
              <span className="relative flex h-1.5 w-1.5 mr-0.5">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gray-400"></span>
              </span>
              연결 조율 중...
            </span>
          )}
        </div>
        <span onClick={onClose} className="cursor-pointer text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </div>

      {/* 예약 현황 상태 바 */}
      {/* ⚠️ 투박한 텍스트 걷어내고 카카오톡에 어울리는 산뜻한 프리미엄 라운드 배지 태그 디자인으로 전면 개편 */}
      <div className="flex justify-between items-center bg-white px-5 py-2.5 border-b border-[#E8E7E3] text-xs select-none">
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="text-gray-400">매칭 상태</span>
          {reservedAt ? (
            <span className="inline-flex items-center gap-1 bg-[#E8F8F5] text-[#117A65] border border-[#A3E4D7] px-2 py-0.5 rounded-full text-[10.5px] font-bold shadow-sm">
              ✔️ 예약 완료
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200/60 px-2 py-0.5 rounded-full text-[10.5px] font-bold animate-pulse shadow-sm">
              ⏳ 대기 중
            </span>
          )}
        </div>
        {!reservedAt && role === 'USER' && (
          <button
            onClick={handleReservationClick}
            disabled={reservationMutation.isPending}
            className="bg-[#2E8C68] hover:bg-[#236b4e] text-white rounded-full px-3.5 py-1 text-[11px] font-extrabold cursor-pointer transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 border-none"
          >
            예약 확정하기
          </button>
        )}
      </div>

      {/* 메시지 리스트 영역 */}
      {/* ⚠️ 과거 정독 시 스크롤 고정용 scrollContainerRef 바인딩. 시원한 가시성을 위해 간격을 gap-4로 확장! */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4.5 flex flex-col gap-4.5">
        {isLoading && (
          <div className="text-center text-xs text-gray-600">
            이전 대화 내용을 불러오는 중...
          </div>
        )}
        {!isLoading && messages.map((msg, index) => {
          const isMine = Number(msg.senderId) === Number(userId)

          // ⚠️ 날짜 경계선 구분 여부 판정 로직
          const currentDateStr = msg.createdAt ? new Date(msg.createdAt).toDateString() : ''
          const prevMsg = index > 0 ? messages[index - 1] : null
          const prevDateStr = prevMsg && prevMsg.createdAt ? new Date(prevMsg.createdAt).toDateString() : ''
          const isNewDay = msg.createdAt && currentDateStr !== prevDateStr

          return (
            <Fragment key={msg.chatMessageId || index}>
              {isNewDay && (
                <div className="flex justify-center my-3 select-none">
                  <span className="bg-black/10 text-white text-[10px] px-3.5 py-1 rounded-full font-medium shadow-sm">
                    {formatDividerDate(msg.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`flex flex-col max-w-[72%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {!isMine && (
                  <div className="text-[11.5px] text-gray-600 mb-1.5 pl-1.5 font-bold select-none">
                    {msg.senderNickname}
                  </div>
                )}
                <div className={`flex items-end gap-2 max-w-full ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 말풍선 본체 */}
                  {/* ⚠️ 가시성 100% 최적화: 텍스트를 시원한 14px로 키우고 패딩도 넉넉하게 px-4.5 py-2.5로 튠업! */}
                  <div
                    className={`px-4.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-all shadow-[0_2px_10px_rgba(29,58,46,0.04)] font-medium min-w-0 ${
                      isMine
                        ? 'bg-gradient-to-br from-[#2E8C68] to-[#1D3A2E] text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-[#E8E7E3]/85'
                    }`}
                  >
                    {msg.messageType === 'TEXT' && <div>{msg.content}</div>}
                    {msg.messageType === 'IMAGE' && (
                      <img
                        src={msg.fileUrl}
                        alt="첨부 이미지"
                        onClick={() => handleImageClick(msg.fileUrl)}
                        className="max-w-full rounded-md border border-gray-100 cursor-zoom-in hover:brightness-90 transition-all object-cover max-h-[160px] shadow-sm"
                      />
                    )}
                    {msg.messageType === 'VIDEO' && (
                      <video src={msg.fileUrl} controls className="max-w-full rounded-md border border-gray-100" />
                    )}
                    {msg.messageType === 'AUDIO' && (
                      <audio src={msg.fileUrl} controls className="max-w-full" />
                    )}
                  </div>

                  {/* 전송 시간 라벨 */}
                  {msg.createdAt && (
                    <span className="text-[10px] text-gray-400 font-semibold select-none whitespace-nowrap mb-0.5">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 전송창 영역 */}
      {/* ⚠️ 럭셔리 라운드 섀도우 보더 및 Outline SVG 첨부/전송 버튼 개편 */}
      <div className="bg-white p-3.5 flex items-center gap-3 border-t border-[#E8E7E3]/60 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <span
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer select-none transition-colors"
        >
          <svg className="w-5.5 h-5.5 text-gray-400 hover:text-[#2E8C68] transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 0A3 3 0 1110.64 6.22l3.536-3.536m0 0a5 5 0 017.072 7.072l-7.656 7.656a7 7 0 11-9.9-9.9l1.414-1.414" />
          </svg>
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border-none bg-[#F4F4F1] px-4.5 py-2.2 rounded-full outline-none text-[13px] text-gray-800 focus:bg-gray-200/70 transition-colors"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-tr from-[#1D3A2E] to-[#2E8C68] hover:to-[#38a57b] w-9.5 h-9.5 flex items-center justify-center rounded-full cursor-pointer transition-all select-none border-none text-white shadow-sm hover:shadow active:scale-95 shrink-0"
        >
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* ⚠️ React Portal을 활용한 360px 한계 극복 글로벌 뷰포트 이미지 뷰어 모달 (body 최상단 순간이동!) */}
      {activeImageUrl && createPortal(
        <div
          onClick={() => setActiveImageUrl(null)}
          className="fixed inset-0 bg-black/94 z-[999999] flex flex-col items-center justify-center p-6 select-none cursor-zoom-out animate-fade-in"
        >
          {/* 상단 우측 닫기 동그라미 버튼 */}
          <div className="absolute top-6 right-6 flex items-center justify-end z-[1000000]">
            <button
              onClick={() => setActiveImageUrl(null)}
              className="bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white w-11 h-11 flex items-center justify-center rounded-full transition-all border-none cursor-pointer"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* 이미지 코어 (드롭 쉐도우 + scale 트랜지션 애니메이션) */}
          <img
            src={activeImageUrl}
            alt="확대 이미지"
            className="max-w-[90%] max-h-[85%] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/5 object-contain transition-all duration-300 transform scale-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()} // 이미지 영역 누르면 안 꺼지게 클릭 전파 방어
          />
        </div>,
        document.body
      )}
    </div>
  )
}
