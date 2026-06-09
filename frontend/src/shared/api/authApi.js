import axiosInstance from './axiosInstance'

export const fetchMe = () =>
  axiosInstance.get('/auth/me').then((res) => res.data)

/**
 * 로그인.
 * 응답 body: { accessToken: string }
 * Set-Cookie로 refresh가 HttpOnly 쿠키에 저장된다.
 */
export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password }).then((res) => res.data)

/**
 * 부팅/만료 시 silent refresh.
 * 응답 body: { accessToken: string } + 새 refresh 쿠키.
 * 호출 시 refresh 쿠키가 자동 전송됨 (Path=/api/auth).
 */
export const refresh = () =>
  axiosInstance.post('/auth/refresh').then((res) => res.data)

export const logout = () =>
  axiosInstance.post('/auth/logout')

export const signup = (data) =>
  axiosInstance.post('/users/signup', data).then((res) => res.data)

export const checkEmail = (email) =>
  axiosInstance.get('/users/check-email', { params: { email } }).then((res) => res.data)

export const checkNickname = (nickname) =>
  axiosInstance.get('/users/check-nickname', { params: { nickname } }).then((res) => res.data)
