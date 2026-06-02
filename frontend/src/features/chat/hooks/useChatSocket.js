import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// Vite + SockJS 브라우저 전역 객체(global) 호환 설정
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window
}

export default function useChatSocket(roomId, onMessageReceived) {
  const [isConnected, setIsConnected] = useState(false)
  const stompClientRef = useRef(null)

  // 최신 수신 메시지 콜백 함수를 안정적으로 보관할 Ref 선언
  const callbackRef = useRef(onMessageReceived)

  // 컴포넌트 렌더링 시마다 Ref를 최신 함수 상태로 업데이트 (웹소켓의 재지정 및 불필요한 끊김 방지)
  useEffect(() => {
    callbackRef.current = onMessageReceived
  }, [onMessageReceived])

  useEffect(() => {
    if (!roomId) return

    // 백엔드 소켓 서버 주소로 직접 연결하여 Vite HMR(핫 리로딩) 웹소켓과의 포트 충돌을 완벽히 회피합니다.
    const socketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws/chats`

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true)
        // 개별 대화방 토픽 구독
        stompClient.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          if (message.body) {
            const parsedMessage = JSON.parse(message.body)
            // 변동성이 큰 의존성(onMessageReceived) 대신, 최신으로 보관된 Ref 콜백을 안전하게 호출
            callbackRef.current?.(parsedMessage)
          }
        })
      },
      onDisconnect: () => {
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error('STOMP 프로토콜 에러:', frame.headers['message'])
      },
    })

    stompClient.activate()
    stompClientRef.current = stompClient

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [roomId]) // 의존성 배열에서 onMessageReceived를 완벽히 격리! 오직 roomId 변경 시에만 소켓을 생성 및 재생성함

  // 메시지 전송 함수
  const sendMessage = (content, messageType = 'TEXT') => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat/message',
        body: JSON.stringify({
          roomId: Number(roomId),
          content: content,
          messageType: messageType,
        }),
      })
    } else {
      console.warn('웹소켓 연결이 수립되지 않았습니다.')
    }
  }

  return { isConnected, sendMessage }
}
