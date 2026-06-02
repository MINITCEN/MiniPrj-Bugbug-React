import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import useAuthStore from '../../auth/store/useAuthStore'
import { fetchChatRooms } from '../../../shared/api/chatApi'
import useChatNotificationStore from '../store/useChatNotificationStore'

// ⚠️ 사용자가 다른 일 할때도 백그라운드에서 모든 채팅방 소켓을 째려보며 새 연락이 오는지 감시하는 리스너 훅!
export default function useChatNotificationListener() {
  const { user, isLoggedIn, accessToken } = useAuthStore()
  const { incrementUnread } = useChatNotificationStore()
  const stompClientRef = useRef(null)

  // 1. 유저가 참여 중인 채팅방 목록 가져오기 (새 방 생겼는지 감지용 폴링 추가)
  const { data: rooms = [] } = useQuery({
    queryKey: ['chatRooms', user?.userId, user?.role],
    queryFn: () => fetchChatRooms(user.userId, user.role),
    enabled: Boolean(isLoggedIn) && Boolean(user?.userId) && Boolean(user?.role),
    refetchInterval: 10000, // 10초마다 갱신해서 헌터 지원하기로 새 방 생겼을 때 자동으로 감지 및 소켓 물리기
  })

  // 소켓 연결 트리거 조건인 방 ID 배열을 단순 문자열로 비교
  const roomIdsString = rooms.map((r) => r.roomId).sort().join(',')

  useEffect(() => {
    // 로그인 안 되어있거나 방이 아예 없거나 토큰 없으면 소켓 연결 X
    if (!isLoggedIn || !user || rooms.length === 0 || !accessToken) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
      return
    }

    const socketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws/chats`

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      // STOMP CONNECT frame Authorization — 서버 JWT 인증용
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        // 참여 중인 방들을 루프돌면서 백그라운드 상시 구독 수립!
        rooms.forEach((room) => {
          stompClient.subscribe(`/topic/chat/room/${room.roomId}`, (message) => {
            if (message.body) {
              const parsedMessage = JSON.parse(message.body)

              // 내가 쓴 메시지가 아니고, 상대방이 보낸 거라면 즉시 안 읽은 카운트 1 올리기!
              if (Number(parsedMessage.senderId) !== Number(user.userId)) {
                incrementUnread(room.roomId)
              }
            }
          })
        })
      },
      onStompError: (frame) => {
        console.error('백그라운드 알림 소켓 통신 실패:', frame.headers['message'])
      },
    })

    stompClient.activate()
    stompClientRef.current = stompClient

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
    }
    // accessToken 변경(refresh rotation) 시 자동 재연결
  }, [isLoggedIn, user?.userId, roomIdsString, incrementUnread, accessToken])
}
