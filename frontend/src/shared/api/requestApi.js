import axiosInstance from './axiosInstance'

export const fetchRequestList = ({ page = 0, size = 10, status, sortType = 'latest' }) =>
  axiosInstance
    .get('/request/wholeList', {
      params: { page, size, status, sortType },
    })
    .then((res) => res.data)

export const createRequest = (formData) =>
  axiosInstance.post('/request/new', formData).then((res) => res.data)

export const fetchRequestDetail = (requestId) =>
  axiosInstance.get(`/request/detail/${requestId}`).then((res) => res.data)

export const deleteRequest = (requestId) =>
  axiosInstance.delete(`/request/remove/${requestId}`).then((res) => res.data)
