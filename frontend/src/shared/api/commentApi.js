import axiosInstance from './axiosInstance'

export const fetchComments = (requestId) =>
  axiosInstance.get(`/requests/${requestId}/comments`).then((res) => res.data)

export const createComment = (requestId, content) =>
  axiosInstance.post(`/requests/${requestId}/comments`, { content }).then((res) => res.data)

export const createReply = (requestId, commentId, content) =>
  axiosInstance.post(`/requests/${requestId}/comments/${commentId}/replies`, { content }).then((res) => res.data)

export const updateComment = (requestId, commentId, content) =>
  axiosInstance.patch(`/requests/${requestId}/comments/${commentId}`, { content }).then((res) => res.data)

export const deleteComment = (requestId, commentId) =>
  axiosInstance.delete(`/requests/${requestId}/comments/${commentId}`)
