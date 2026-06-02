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
  
  // 가로 720px 팝업이 화면 좌우 경계를 절대 침범하지 않도록 계산하는 지능형 안전 바운더리 공식
  const isPopupRight = position.x < 660
    ? true
    : (position.x > window.innerWidth - 720 ? false : position.x < window.innerWidth / 2)

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
        <svg className="w-[48px] h-[40px] filter drop-shadow-sm select-none" viewBox="0 0 54 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(11, -7)">
            <path d="M30 29.5C30 21.768 23.732 15.5 16 15.5C8.268 15.5 2 21.768 2 29.5C2 33.174 3.417 36.516 5.738 39L0 44.5L7.341 41.915C9.942 42.938 12.877 43.5 16 43.5C23.732 43.5 30 37.232 30 29.5Z" fill="white"/>
            <path d="M10 30C11.3807 30 12.5 28.8807 12.5 27.5C12.5 26.1193 11.3807 25 10 25C8.61929 25 7.5 26.1193 7.5 27.5C7.5 28.8807 8.61929 30 10 30Z" fill="#0B4627"/>
            <path d="M22 30C23.3807 30 24.5 28.8807 24.5 27.5C24.5 26.1193 23.3807 25 22 25C20.6193 25 19.5 26.1193 19.5 27.5C19.5 28.8807 20.6193 30 22 30Z" fill="#0B4627"/>
            <path d="M11 33.5C14.3333 36.1667 17.6667 36.1667 21 33.5" stroke="#0B4627" strokeWidth="2.5" strokeLinecap="round"/>
          </g>
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#e5573a] text-white text-[10px] font-black rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* 채팅 창 영역 */}
      {/* ⚠️ 럭셔리 반투명 밀키 글래스모피즘(backdrop-blur-xl bg-white/90) 및 부드러운 하이 엔드 섀도우 탑재 */}
      {/* 💡 당근마켓 웹 스타일의 w-[720px] x h-[560px] 와이드 2분할(Split-Pane) 프레임 대대적 개편 */}
      <div
        className={`absolute w-[720px] max-w-[calc(100vw-40px)] h-[560px] bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_30px_70px_rgba(15,40,30,0.18)] overflow-hidden border border-white/30 flex flex-row transition-all duration-300 transform ${
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
        {/* ────────── 좌측: 채팅 목록 (300px 고정 및 찌그러짐 방지) ────────── */}
        <div className="w-[300px] shrink-0 border-r border-[#E8E7E3] flex flex-col min-h-0 bg-white">
          {/* 목록 헤더 */}
          <div className="bg-gradient-to-r from-[#1D3A2E] to-[#254d3d] px-5 py-4.5 flex items-center justify-between text-white relative select-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] select-none z-10">
            <span className="tracking-wider text-[14px] font-extrabold">실시간 1:1 상담</span>
            <span
              onClick={handleToggle}
              className="cursor-pointer text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </div>
          {/* 목록 리스트 */}
          <ChatRoomList
            userId={user.userId}
            role={user.role}
            selectedRoomId={selectedRoom?.roomId} // ⚠️ active room 하이라이팅 연동!
            onSelectRoom={(room) => setSelectedRoom(room)}
          />
        </div>

        {/* ────────── 우측: 상세 대화방 또는 대기 화면 (420px 유연) ────────── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8F7F3]">
          {selectedRoom ? (
            <ChatRoomDetail
              roomId={selectedRoom.roomId}
              otherNickname={selectedRoom.otherNickname}
              initialReservedAt={selectedRoom.reservedAt}
              userId={user.userId}
              role={user.role}
              onBack={() => setSelectedRoom(null)} // ⚠️ 2분할 뷰에서는 리스트로 튕기는 게 아니라 상세 방 선택만 클리어!
              onClose={handleToggle}
            />
          ) : (
            /* ⚠️ 대기 상태 프리미엄 Empty State (마스코트 얼굴 + 안내 텍스트 구성) */
            <div 
              className="flex-1 flex flex-col items-center justify-center gap-4.5 text-center select-none p-8"
              style={{
                background: `
                  radial-gradient(circle 350px at 50% 50%, rgba(46,140,104,.06), transparent 70%),
                  #F8F7F3
                `
              }}
            >
              <div className="w-[85px] h-[85px] bg-gradient-to-tr from-[#1D3A2E] to-[#2E8C68] rounded-full flex items-center justify-center shadow-lg animate-bounce duration-1000">
                <svg className="w-[60px] h-[50px] filter drop-shadow-sm" viewBox="0 0 54 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(11, -7)">
                    <path d="M30 29.5C30 21.768 23.732 15.5 16 15.5C8.268 15.5 2 21.768 2 29.5C2 33.174 3.417 36.516 5.738 39L0 44.5L7.341 41.915C9.942 42.938 12.877 43.5 16 43.5C23.732 43.5 30 37.232 30 29.5Z" fill="white"/>
                    <path d="M10 30C11.3807 30 12.5 28.8807 12.5 27.5C12.5 26.1193 11.3807 25 10 25C8.61929 25 7.5 26.1193 7.5 27.5C7.5 28.8807 8.61929 30 10 30Z" fill="#0B4627"/>
                    <path d="M22 30C23.3807 30 24.5 28.8807 24.5 27.5C24.5 26.1193 23.3807 25 22 25C20.6193 25 19.5 26.1193 19.5 27.5C19.5 28.8807 20.6193 30 22 30Z" fill="#0B4627"/>
                    <path d="M11 33.5C14.3333 36.1667 17.6667 36.1667 21 33.5" stroke="#0B4627" strokeWidth="2.5" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
              <div className="flex flex-col gap-1.2">
                <h4 className="text-[14.5px] font-black text-gray-800 tracking-tight">대화방을 선택해 주세요</h4>
                <p className="text-[11.5px] text-gray-500 font-semibold leading-relaxed max-w-[280px]">
                  상담하실 대화방을 좌측에서 선택하시면 실시간 1:1 상담 채팅이 우측에 나타납니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
