import { create } from 'zustand'
import { fetchMe } from '../../../shared/api/authApi'

/**
 * 인증 상태 + JWT access 토큰 메모리 저장소.
 *
 * - accessToken은 JS 메모리에만 보관 (localStorage X — XSS 노출 회피).
 *   탭이 닫히거나 새로고침되면 휘발. 새로고침은 App.jsx에서 silent refresh로 복구.
 * - refresh 토큰은 서버가 HttpOnly 쿠키로 관리. 프론트는 접근 불가.
 * - axios interceptor는 hook 못 쓰므로 store.getState().accessToken으로 읽어 헤더 부착.
 */
const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),

  fetchMe: async () => {
    try {
      const data = await fetchMe()
      set({ user: data, isLoggedIn: true, isLoading: false })
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false, accessToken: null })
    }
  },

  clearUser: () => set({ user: null, isLoggedIn: false, isLoading: false, accessToken: null }),
}))

export default useAuthStore
