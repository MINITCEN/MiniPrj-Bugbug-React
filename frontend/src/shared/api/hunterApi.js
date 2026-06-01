import axiosInstance from './axiosInstance'

export const fetchHunters = ({ page = 0, size = 10 } = {}) =>
  axiosInstance.get('/hunters', { params: { page, size } }).then((r) => r.data)

export const fetchHunterProfile = (hunterId) =>
  axiosInstance.get(`/hunters/${hunterId}/profile`).then((r) => r.data)

export const fetchHunterReviews = (hunterId, { page = 0, size = 5 } = {}) =>
  axiosInstance.get(`/hunters/${hunterId}/reviews`, { params: { page, size } }).then((r) => r.data)

export const toggleSavedHunter = (hunterId) =>
  axiosInstance.post(`/hunters/${hunterId}/bookmarks`).then((r) => r.data)
