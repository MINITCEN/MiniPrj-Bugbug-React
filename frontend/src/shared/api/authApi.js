import axiosInstance from './axiosInstance'

export const fetchMe = () =>
  axiosInstance.get('/auth/me').then((res) => res.data)

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password }).then((res) => res.data)

export const logout = () =>
  axiosInstance.post('/auth/logout')

export const signup = (data) =>
  axiosInstance.post('/users/signup', data).then((res) => res.data)

export const checkEmail = (email) =>
  axiosInstance.get('/users/check-email', { params: { email } }).then((res) => res.data)

export const checkNickname = (nickname) =>
  axiosInstance.get('/users/check-nickname', { params: { nickname } }).then((res) => res.data)
