import { useState } from 'react'
import useAuthStore from '../../auth/store/useAuthStore'
import ChatRoomList from './ChatRoomList'
import ChatRoomDetail from './ChatRoomDetail'

export default function FloatingChatWidget() {
  const { user, isLoggedIn } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  // 로그인되지 않은 사용자는 위젯 렌더링 안 함
  if (!isLoggedIn || !user) return null

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    // 창을 새로 열 때는 항상 대화 목록으로 초기화
    if (!isOpen) {
      setSelectedRoom(null)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans antialiased">
      {/* 플로팅 둥근 버튼 */}
      <button
        onClick={handleToggle}
        className="w-[60px] h-[60px] bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center text-2xl transition-transform hover:scale-110 border-none select-none"
      >
        💬
      </button>

      {/* 채팅 창 영역 */}
      {isOpen && (
        <div className="absolute bottom-[80px] right-0 w-[350px] h-[500px] bg-[#B2C7D9] rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col transition-all">
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
      )}
    </div>
  )
}
