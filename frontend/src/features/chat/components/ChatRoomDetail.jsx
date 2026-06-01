import { useEffect, useRef, useState, Fragment } from 'react'
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
  const { sendMessage } = useChatSocket(roomId, (newMessage) => {
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
    <div className="flex-1 flex flex-col h-full bg-[#B2C7D9]">
      {/* 대화방 헤더 */}
      <div className="bg-[#A9BDCE] px-4 py-3 flex items-center justify-between font-bold border-b border-black/10 text-gray-800 relative select-none">
        <span onClick={onBack} className="cursor-pointer text-lg font-bold">⬅️</span>
        <span className="text-center">{otherNickname}</span>
        <span onClick={onClose} className="cursor-pointer text-lg">✕</span>
      </div>

      {/* 예약 현황 상태 바 */}
      {/* ⚠️ 투박한 텍스트 걷어내고 카카오톡에 어울리는 산뜻한 프리미엄 라운드 배지 태그 디자인으로 전면 개편 */}
      <div className="flex justify-between items-center bg-white px-4 py-2.5 border-b border-gray-200 text-xs select-none">
        <div className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="text-gray-400">매칭 상태</span>
          {reservedAt ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
              ✔️ 예약 완료
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200/60 px-2 py-0.5 rounded-full text-[11px] font-bold animate-pulse">
              ⏳ 대기 중
            </span>
          )}
        </div>
        {!reservedAt && role === 'USER' && (
          <button
            onClick={handleReservationClick}
            disabled={reservationMutation.isPending}
            className="bg-[#4e73df] hover:bg-[#3b59b6] text-white rounded-full px-3.5 py-1 text-[11px] font-extrabold cursor-pointer transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 border-none"
          >
            예약 확정하기
          </button>
        )}
      </div>

      {/* 메시지 리스트 영역 */}
      {/* ⚠️ 과거 정독 시 스크롤 고정용 scrollContainerRef 바인딩 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
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
                className={`flex flex-col max-w-[85%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {!isMine && (
                  <div className="text-[11px] text-gray-700 mb-1 pl-1">
                    {msg.senderNickname}
                  </div>
                )}
                <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 말풍선 본체 */}
                  <div
                    className={`px-3 py-2 text-sm leading-relaxed rounded-xl break-words ${
                      isMine
                        ? 'bg-[#FEE500] text-gray-900 rounded-tr-none'
                        : 'bg-white text-gray-900 rounded-tl-none'
                    }`}
                  >
                    <div>{msg.content}</div>
                    {msg.messageType === 'IMAGE' && (
                      <img src={msg.fileUrl} alt="첨부 이미지" className="max-w-full rounded-md mt-1 border border-gray-100" />
                    )}
                    {msg.messageType === 'VIDEO' && (
                      <video src={msg.fileUrl} controls className="max-w-full rounded-md mt-1 border border-gray-100" />
                    )}
                    {msg.messageType === 'AUDIO' && (
                      <audio src={msg.fileUrl} controls className="max-w-full mt-1" />
                    )}
                  </div>

                  {/* 전송 시간 라벨 */}
                  {msg.createdAt && (
                    <span className="text-[10px] text-gray-600 select-none whitespace-nowrap mb-0.5">
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
      <div className="bg-white p-3 flex items-center gap-3 border-t border-gray-200">
        <span
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer text-xl text-gray-400 select-none hover:text-gray-600 transition-colors"
        >
          📎
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
          placeholder="메시지 입력"
          className="flex-1 border-none bg-gray-100 px-4 py-2 rounded-full outline-none text-sm text-gray-800 focus:bg-gray-200 transition-colors"
        />
        <button
          onClick={handleSend}
          className="bg-[#FEE500] w-9 h-9 flex items-center justify-center rounded-full text-lg cursor-pointer hover:brightness-95 transition-all select-none border-none text-gray-800"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
