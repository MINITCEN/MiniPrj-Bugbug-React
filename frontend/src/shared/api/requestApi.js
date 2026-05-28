import axiosInstance from './axiosInstance'

export const fetchRecentRequests = (size = 4) =>
  axiosInstance.get(`/request/recent?size=${size}`).then((res) => res.data)
