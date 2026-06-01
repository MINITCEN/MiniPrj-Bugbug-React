import { useQuery } from '@tanstack/react-query'
import { fetchChatRooms } from '../../../shared/api/chatApi'
import useChatNotificationStore from '../store/useChatNotificationStore'

// 마지막 메시지 전송 일시를 카카오톡 스타일로 보기 좋게 가공하는 헬퍼 함수
function formatLastMessageTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  // 1. 오늘 보낸 메시지: "오후 3:45"
  if (isToday) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  // 2. 어제 보낸 메시지: "어제"
  if (isYesterday) {
    return '어제'
  }

  // 3. 올해 보낸 메시지: "5월 13일"
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // 4. 작년 혹은 그 이전 메시지: "2025년 5월 13일"
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export default function ChatRoomList({ userId, role, onSelectRoom }) {
  const { unreadCounts } = useChatNotificationStore()
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

  // 백엔드에서 마지막 대화 전송 시간 기준으로 이미 내림차순 정렬되어 넘어옵니다.
  const sortedRooms = rooms

  // ⚠️ flex 컨테이너 안에서 스크롤 작동하려면 min-h-0 필수! global 안더럽히고 tailwind inline으로만 스크롤바 슬림하게 깎음
  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-0 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/35 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]">
      {sortedRooms.map((room) => {
        const unreadCount = unreadCounts[room.roomId] || 0
        return (
          <div
            key={room.roomId}
            onClick={() => onSelectRoom(room)}
            className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors bg-white select-none"
          >
            {/* 아바타 */}
            <div className="w-11 h-11 rounded-[40%] bg-gray-200 mr-3.5 flex items-center justify-center text-xl shrink-0">
              👤
            </div>
            {/* 대화 정보 (카카오톡 카드 레이아웃화) */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {/* 상단 행: 상대방 닉네임 */}
              <strong className="font-bold text-[15px] text-gray-800 truncate">
                {room.otherNickname}
              </strong>
              {/* 중간 행: 마지막 메시지 미리보기 */}
              <div className="text-[13px] text-gray-600 truncate font-normal">
                {room.lastMessage || '대화 내용이 없습니다.'}
              </div>
              {/* 하단 행: 대상 의뢰글 명칭 */}
              <div className="text-[11px] text-gray-400 truncate">
                의뢰: {room.title}
              </div>
            </div>
            {/* 우측 사이드 정보 행 (시간 + 실시간 알림 빨간 배지) */}
            <div className="flex flex-col items-end justify-start shrink-0 ml-3.5 gap-1.5 self-stretch">
              {room.lastMessageSentAt && (
                <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                  {formatLastMessageTime(room.lastMessageSentAt)}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
