import { useState, useEffect, useRef } from 'react'
import useAuthStore from '../../auth/store/useAuthStore'
import ChatRoomList from './ChatRoomList'
import ChatRoomDetail from './ChatRoomDetail'
import useChatNotificationStore from '../store/useChatNotificationStore'
import useChatNotificationListener from '../hooks/useChatNotificationListener'

export default function FloatingChatWidget() {
  const { user, isLoggedIn } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  // ⚠️ 드래그 가능 위치 관리를 위한 픽셀 좌표 상태
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  // 드래그 상태 제어용 Refs
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const buttonStartRef = useRef({ x: 0, y: 0 })
  const dragDistanceRef = useRef(0)

  // ⚠️ 백그라운드 소켓 상시 리스닝 훅 발동! (유저 로그인 시에만 작동)
  useChatNotificationListener()

  const { setActiveRoomId, getTotalUnreadCount } = useChatNotificationStore()
  const totalUnread = getTotalUnreadCount()

  // 1. 화면 처음 켰을 때: 원래 위치보다 "좀 더 위로, 안쪽으로" 디폴트 세팅!
  useEffect(() => {
    if (!isLoggedIn || !user) return

    // 우측에서 45px 안쪽, 하단에서 95px 위쪽으로 이쁘게 위치 설정
    const defaultX = window.innerWidth - 60 - 45
    const defaultY = window.innerHeight - 60 - 95
    setPosition({ x: defaultX, y: defaultY })
    setIsInitialized(true)
  }, [isLoggedIn, user])

  // 2. 브라우저 리사이즈 시 화면 바깥 탈출 방지
  useEffect(() => {
    if (!isInitialized) return

    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 60 - 10
        const maxY = window.innerHeight - 60 - 10
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialized])

  // 선택한 대화방이 바뀌거나 창 열고 닫을 때 activeRoomId 동기화
  useEffect(() => {
    if (isOpen && selectedRoom) {
      setActiveRoomId(selectedRoom.roomId)
    } else {
      setActiveRoomId(null)
    }
  }, [isOpen, selectedRoom, setActiveRoomId])

  // 로그인되지 않은 사용자는 위젯 렌더링 안 함
  if (!isLoggedIn || !user) return null

  // --- 🖐️ 마우스/터치 드래그 이벤트 핸들러 구현 ---

  // 1) PC 마우스 드래그 핸들러
  const handleMouseDown = (e) => {
    if (e.button !== 0) return // 좌클릭만 허용
    isDraggingRef.current = true
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    buttonStartRef.current = { x: position.x, y: position.y }
    dragDistanceRef.current = 0

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault() // 드래그 시 브라우저 기본 텍스트 블록 방지
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y
    dragDistanceRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let newX = buttonStartRef.current.x + deltaX
    let newY = buttonStartRef.current.y + deltaY

    // Bounding Box 화면 탈출 봉쇄
    const maxX = window.innerWidth - 60 - 10
    const maxY = window.innerHeight - 60 - 10
    newX = Math.min(Math.max(10, newX), maxX)
    newY = Math.min(Math.max(10, newY), maxY)

    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // 2) 모바일 터치 드래그 핸들러
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    isDraggingRef.current = true
    dragStartRef.current = { x: touch.clientX, y: touch.clientY }
    buttonStartRef.current = { x: position.x, y: position.y }
    dragDistanceRef.current = 0
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return
    const touch = e.touches[0]

    const deltaX = touch.clientX - dragStartRef.current.x
    const deltaY = touch.clientY - dragStartRef.current.y
    dragDistanceRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let newX = buttonStartRef.current.x + deltaX
    let newY = buttonStartRef.current.y + deltaY

    const maxX = window.innerWidth - 60 - 10
    const maxY = window.innerHeight - 60 - 10
    newX = Math.min(Math.max(10, newX), maxX)
    newY = Math.min(Math.max(10, newY), maxY)

    setPosition({ x: newX, y: newY })
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  // 드래그 거리 판별하여 클릭 vs 무브 스위칭 토글
  const handleButtonClick = () => {
    if (dragDistanceRef.current > 5) {
      return // 5px 이상 끌었으면 이동으로 간주하여 채팅창 안 띄움
    }
    handleToggle()
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      setSelectedRoom(null)
    }
  }

  // ⚠️ 팝업창 지능형 화면 탈출 방지 정렬 연산
  const isPopupBelow = position.y < 500
  const isPopupRight = position.x < 350

  const widgetStyle = isInitialized
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { right: '45px', bottom: '95px' } // 초기화 전 폴백용 스타일

  return (
    <div
      style={widgetStyle}
      className="fixed z-[9999] font-sans antialiased select-none touch-none"
    >
      {/* 플로팅 둥근 버튼 */}
      {/* ⚠️ 3D 입체 그라데이션 및 신비로운 에메랄드 네온 글로우링 발산 (럭셔리 UX 극대화) */}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleButtonClick}
        className="w-[60px] h-[60px] bg-gradient-to-tr from-[#1D3A2E] to-[#2E8C68] hover:to-[#38a57b] text-white rounded-full shadow-[0_10px_30px_rgba(46,140,104,0.35)] hover:shadow-[0_15px_35px_rgba(46,140,104,0.5)] cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 border-none select-none relative active:scale-95 animate-fade-in"
      >
        <svg className="w-6.5 h-6.5 text-white filter drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.9 2.68 3.13Fm.24 2.1c.3.08.6-.13.6-.44V16.5M21 12c0 4.14-4.03 7.5-9 7.5a9.66 9.66 0 01-1.9-.19l-4.5 2.25A.5.5 0 015 21v-3.75C2.5 15.68 1 13.03 1 12c0-4.14 4.03-7.5 9-7.5s9 3.36 9 7.5z" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#e5573a] text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* 채팅 창 영역 */}
      {/* ⚠️ 럭셔리 반투명 밀키 글래스모피즘(backdrop-blur-xl bg-white/90) 및 부드러운 하이 엔드 섀도우 탑재 */}
      <div
        className={`absolute w-[360px] h-[520px] bg-white/92 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(29,58,46,0.15)] overflow-hidden border border-white/20 flex flex-col transition-all duration-300 transform ${
          isPopupBelow ? 'top-[72px]' : 'bottom-[82px]'
        } ${
          isPopupRight ? 'left-0' : 'right-0'
        } ${
          isPopupBelow
            ? isPopupRight ? 'origin-top-left' : 'origin-top-right'
            : isPopupRight ? 'origin-bottom-left' : 'origin-bottom-right'
        } ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : isPopupBelow
              ? 'opacity-0 -translate-y-10 scale-95 pointer-events-none'
              : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
        }`}
      >
        {!selectedRoom ? (
          <div className="flex-1 flex flex-col bg-[#F9F9F6]/95 min-h-0">
            {/* 목록 헤더 */}
            {/* ⚠️ 시크한 딥 포레스트 그라데이션 및 메탈릭 선형 ✕ 아이콘 */}
            <div className="bg-gradient-to-r from-[#1D3A2E] to-[#254d3d] px-5 py-4.5 flex items-center justify-center text-white relative select-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <span className="tracking-wider text-[14px] font-extrabold">실시간 1:1 상담</span>
              <span
                onClick={handleToggle}
                className="absolute right-5 top-4.5 cursor-pointer text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </div>
            {/* 목록 영역 */}
            <ChatRoomList
              userId={user.userId}
              role={user.role}
              onSelectRoom={(room) => setSelectedRoom(room)}
            />
          </div>
        ) : (
          <ChatRoomDetail
            roomId={selectedRoom.roomId}
            otherNickname={selectedRoom.otherNickname}
            initialReservedAt={selectedRoom.reservedAt}
            userId={user.userId}
            role={user.role}
            onBack={() => setSelectedRoom(null)}
            onClose={handleToggle}
          />
        )}
      </div>
    </div>
  )
}
