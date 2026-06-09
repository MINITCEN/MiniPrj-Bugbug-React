import axiosInstance from './axiosInstance'

export const fetchRequestList = ({ page = 0, size = 10, status, sortType = 'latest' }) =>
  axiosInstance
    .get('/request/wholeList', {
      params: { page, size, status, sortType },
    })
    .then((res) => res.data)

export const createRequest = (formData) =>
  axiosInstance.post('/request/new', formData).then((res) => res.data)

export const fetchRequestEditForm = (requestId) =>
  axiosInstance.get(`/request/edit/${requestId}`).then((res) => res.data)

export const updateRequest = (requestId, formData) =>
  axiosInstance.patch(`/request/edit/${requestId}`, formData).then((res) => res.data)

export const fetchRequestDetail = (requestId) =>
  axiosInstance.get(`/request/detail/${requestId}`).then((res) => res.data)

export const deleteRequest = (requestId) =>
  axiosInstance.delete(`/request/remove/${requestId}`).then((res) => res.data)

export const fetchSavedRequest = (requestId) =>
  axiosInstance.get(`/hunters/requests/${requestId}/bookmarks`).then((res) => res.data)

export const toggleSavedRequest = (requestId) =>
  axiosInstance.post(`/hunters/requests/${requestId}/bookmarks`).then((res) => res.data)

export const applyRequest = (requestId) =>
  axiosInstance.post(`/requests/${requestId}/apply`).then((res) => res.data)
