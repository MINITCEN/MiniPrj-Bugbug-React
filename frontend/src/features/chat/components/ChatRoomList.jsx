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

export default function ChatRoomList({ userId, role, onSelectRoom, selectedRoomId }) {
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
        const initialLetter = room.otherNickname?.charAt(0) || '👤'
        const isSelected = room.roomId === selectedRoomId

        return (
          <div
            key={room.roomId}
            onClick={() => onSelectRoom(room)}
            className={`flex items-center p-4 border-b border-[#F0EFF8] cursor-pointer transition-all select-none gap-2.5 border-l-4 ${
              isSelected
                ? 'bg-[#1D3A2E]/[0.05] border-l-[#2E8C68]'
                : 'bg-white hover:bg-[#1D3A2E]/[0.02] border-l-transparent hover:border-l-[#2E8C68]'
            }`}
          >
            {/* ⚠️ 럭셔리 이니셜 그라데이션 프로필 뱃지 */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D3A2E] to-[#2E8C68] text-white flex items-center justify-center text-[13px] font-black shrink-0 shadow-sm shadow-[#1D3A2E]/10">
              {initialLetter}
            </div>
            {/* 대화 정보 (카카오톡 카드 레이아웃화) */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.8">
              {/* 상단 행: 상대방 닉네임 */}
              <strong className="font-extrabold text-[14px] text-gray-800 truncate">
                {room.otherNickname}
              </strong>
              {/* 중간 행: 마지막 메시지 미리보기 */}
              <div className="text-[12.5px] text-gray-500 truncate font-semibold">
                {room.lastMessage || '대화 내용이 없습니다.'}
              </div>
              {/* 하단 행: 대상 의뢰글 명칭 (고급 뱃지 태그화) */}
              <div className="text-[10px] text-gray-400 font-bold bg-[#F4F4F1] border border-[#E8E7E3]/60 px-1.8 py-0.5 rounded-md w-fit">
                {room.title}
              </div>
            </div>
            {/* 우측 사이드 정보 행 (시간 + 실시간 알림 빨간 배지) */}
            <div className="flex flex-col items-end justify-start shrink-0 gap-1.5 self-stretch">
              {room.lastMessageSentAt && (
                <span className="text-[10.5px] text-gray-400 shrink-0 font-semibold">
                  {formatLastMessageTime(room.lastMessageSentAt)}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="bg-[#e5573a] text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center shadow-sm">
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
