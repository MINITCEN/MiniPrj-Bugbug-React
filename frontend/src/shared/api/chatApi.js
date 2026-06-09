import axiosInstance from './axiosInstance'

// 내 채팅방 목록 가져오기
export const fetchChatRooms = async (userId, role) => {
  const response = await axiosInstance.get('/chats', {
    params: { userId, role },
  })
  return response.data
}

// 특정 대화방의 이전 대화 목록 로드
export const fetchChatMessages = async (roomId) => {
  const response = await axiosInstance.get(`/chats/${roomId}/messages`)
  return response.data
}

// 채팅 내 파일 업로드 (이미지, 동영상 등)
export const uploadChatFile = async (roomId, file, messageType) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('messageType', messageType)

  const response = await axiosInstance.post(`/chats/${roomId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 매칭 예약 확정
export const confirmReservation = async (roomId, reservedAt) => {
  const response = await axiosInstance.post(`/chats/${roomId}/reservation`, {
    reservedAt,
  })
  return response.data
}
