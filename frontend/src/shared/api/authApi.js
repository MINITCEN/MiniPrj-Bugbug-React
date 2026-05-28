import axiosInstance from './axiosInstance'

export const fetchMe = () =>
  axiosInstance.get('/auth/me').then((res) => res.data)

export const logout = () =>
  axiosInstance.post('/auth/logout')
