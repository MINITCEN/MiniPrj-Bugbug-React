import { create } from 'zustand'

// ⚠️ 실시간 알림 배지 카운트를 전역으로 짱짱하게 관리하는 녀석
const useChatNotificationStore = create((set, get) => ({
  // 각 채팅방 ID별로 안 읽은 메시지 개수 매핑 { [roomId]: number }
  unreadCounts: {},
  
  // 지금 사용자가 째려보고 있는 채팅방 ID (이 방은 안 읽은 카운트 안 쌓임)
  activeRoomId: null,

  // 새로운 메시지 들어왔을 때 카운트 +1 해주는 함수
  incrementUnread: (roomId) => {
    const { activeRoomId, unreadCounts } = get()
    const rId = Number(roomId)
    
    // 만약 지금 이 방 들어가서 대화 중이면 안 읽은 카운트 올릴 필요 전혀 없음!
    if (activeRoomId === rId) return

    set({
      unreadCounts: {
        ...unreadCounts,
        [rId]: (unreadCounts[rId] || 0) + 1,
      },
    })
  },

  // 특정 방 나가거나 읽었을 때 카운트 슥 삭 제
  clearUnread: (roomId) => {
    const { unreadCounts } = get()
    const rId = Number(roomId)
    if (!unreadCounts[rId]) return

    set({
      unreadCounts: {
        ...unreadCounts,
        [rId]: 0,
      },
    })
  },

  // 현재 대화방 입장/퇴장 시 세팅해주는 함수 (입장과 동시에 안 읽은 건 0으로 리셋)
  setActiveRoomId: (roomId) => {
    const { unreadCounts } = get()
    const targetRoomId = roomId ? Number(roomId) : null

    set({
      activeRoomId: targetRoomId,
      unreadCounts: targetRoomId
        ? {
            ...unreadCounts,
            [targetRoomId]: 0,
          }
        : unreadCounts,
    })
  },

  // 노란 💬 버튼 위에 띄울 총 알림 배지 숫자 합산 헬퍼
  getTotalUnreadCount: () => {
    const { unreadCounts } = get()
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
  },
}))

export default useChatNotificationStore
