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

  // 1. 화면 처음 켰을 때: 원래 위치(bottom: 20px, right: 20px)보다 "좀 더 위로, 안쪽으로" 디폴트 세팅!
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

    // Bounding Box 화면 탈출 봉쇄 (버튼 크기 60px, 모서리 패딩 10px)
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

  // ⚠️ 누락되었던 팝업 토글 함수 원상 복구!
  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    // 창을 새로 열 때는 항상 대화 목록으로 초기화
    if (!isOpen) {
      setSelectedRoom(null)
    }
  }

  // 드래그 거리 판별하여 클릭 vs 무브 스위칭 토글
  const handleButtonClick = () => {
    if (dragDistanceRef.current > 5) {
      return // 5px 이상 끌었으면 이동으로 간주하여 채팅창 안 띄움
    }
    handleToggle()
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
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleButtonClick}
        className="w-[60px] h-[60px] bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center text-2xl transition-transform hover:scale-110 border-none select-none relative active:scale-95 animate-fade-in"
      >
        💬
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-extrabold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* 채팅 창 영역 */}
      {/* ⚠️ 스마트 가로/세로 자동 뒤집기 애니메이션 및 오차없는 Bounding Transition 구현 */}
      <div
        className={`absolute w-[350px] h-[500px] bg-[#B2C7D9] rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col transition-all duration-300 transform ${
          isPopupBelow ? 'top-[70px]' : 'bottom-[80px]'
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
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {/* 목록 헤더 */}
            <div className="bg-[#A9BDCE] px-4 py-4 flex items-center justify-center font-bold border-b border-black/10 text-gray-800 relative select-none">
              <span>채팅 목록</span>
              <span
                onClick={handleToggle}
                className="absolute right-4 top-4 cursor-pointer text-lg"
              >
                ✕
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
