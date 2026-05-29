import axiosInstance from './axiosInstance'

export const fetchMe = () =>
  axiosInstance.get('/auth/me').then((res) => res.data)

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password }).then((res) => res.data)

export const logout = () =>
  axiosInstance.post('/auth/logout')
