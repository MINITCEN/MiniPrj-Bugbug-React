import { useQuery } from '@tanstack/react-query'
import { fetchChatRooms } from '../../../shared/api/chatApi'

export default function ChatRoomList({ userId, role, onSelectRoom }) {
  const { data: rooms = [], isLoading, isError } = useQuery({
    queryKey: ['chatRooms', userId, role],
    queryFn: () => fetchChatRooms(userId, role),
    enabled: Boolean(userId) && Boolean(role),
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 font-medium py-10 bg-white">
        로딩 중...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 font-medium py-10 bg-white">
        목록을 불러오지 못했습니다.
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 font-medium py-10 bg-white">
        참여 중인 채팅방이 없습니다.
      </div>
    )
  }

  // 최근 개설된 대화방(roomId가 클수록 최신 방)이 목록 가장 상단에 오도록 내림차순 정렬
  const sortedRooms = [...rooms].sort((a, b) => b.roomId - a.roomId)

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {sortedRooms.map((room) => (
        <div
          key={room.roomId}
          onClick={() => onSelectRoom(room)}
          className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-11 h-11 rounded-[40%] bg-gray-200 mr-4 flex items-center justify-center text-xl select-none">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] text-gray-800 truncate mb-1">
              {room.otherNickname} 님과의 대화
            </div>
            <div className="text-[13px] text-gray-500 truncate">
              의뢰: {room.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
