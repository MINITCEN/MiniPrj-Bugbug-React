import axios from 'axios'
import useAuthStore from '../../features/auth/store/useAuthStore'

/**
 * 공용 axios 인스턴스.
 *
 * - baseURL '/api' → vite dev proxy로 백엔드 :8080 으로 포워딩.
 * - withCredentials: true → refresh 쿠키(HttpOnly)를 자동으로 보내기 위해.
 * - request interceptor: 메모리의 accessToken이 있으면 Authorization 헤더 부착.
 * - response interceptor: 401 발생 시 한 번만 silent refresh 후 원 요청 재시도.
 *   동시에 다발하는 401은 단일 refreshPromise를 공유해 refresh를 한 번만 호출.
 *   refresh 자체가 실패하면 사용자 정리 후 로그인으로 리다이렉트.
 */
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    // refresh API 자체가 401이거나 이미 한 번 재시도한 요청은 더 이상 시도하지 않음.
    if (
      status !== 401 ||
      !original ||
      original._retried ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }
    original._retried = true

    // 동시에 발생한 다수의 401에 대해 refresh는 1번만 수행.
    // interceptor 재귀 회피를 위해 raw axios 호출.
    refreshPromise ??= axios
      .post('/api/auth/refresh', null, { withCredentials: true })
      .then((res) => {
        const newToken = res.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        return newToken
      })
      .catch((refreshError) => {
        useAuthStore.getState().clearUser()
        // 라우터 history 접근 없는 곳에서 호출되므로 강제 이동.
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        throw refreshError
      })
      .finally(() => {
        refreshPromise = null
      })

    try {
      const newToken = await refreshPromise
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance
