import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChatMessages, uploadChatFile, confirmReservation as apiConfirmReservation } from '../../../shared/api/chatApi'
import useChatSocket from '../hooks/useChatSocket'

export default function ChatRoomDetail({ roomId, otherNickname, initialReservedAt, userId, role, onBack, onClose }) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [reservedAt, setReservedAt] = useState(initialReservedAt)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // 이전 대화 기록 가져오기
  const { data: previousMessages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', roomId],
    queryFn: () => fetchChatMessages(roomId),
    enabled: Boolean(roomId),
  })

  // 받아온 이전 메시지 내역 시간순 정렬 및 바인딩
  useEffect(() => {
    if (previousMessages) {
      setMessages([...previousMessages].reverse())
    }
  }, [previousMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
      <div className="flex justify-between items-center bg-white px-4 py-2 border-b border-gray-200 text-xs text-gray-600 select-none">
        <span>
          {reservedAt ? '📌 매칭 상태: 예약 완료' : '📌 매칭 상태: 대기 중'}
        </span>
        {!reservedAt && role === 'USER' && (
          <button
            onClick={handleReservationClick}
            disabled={reservationMutation.isPending}
            className="bg-[#4e73df] text-white rounded px-3 py-1 font-bold cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-50 border-none"
          >
            예약 완료하기
          </button>
        )}
      </div>

      {/* 메시지 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {isLoading && (
          <div className="text-center text-xs text-gray-600">
            이전 대화 내용을 불러오는 중...
          </div>
        )}
        {!isLoading && messages.map((msg, index) => {
          const isMine = Number(msg.senderId) === Number(userId)
          return (
            <div
              key={msg.chatMessageId || index}
              className={`flex flex-col max-w-[70%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {!isMine && (
                <div className="text-[11px] text-gray-700 mb-1 pl-1">
                  {msg.senderNickname}
                </div>
              )}
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
            </div>
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
