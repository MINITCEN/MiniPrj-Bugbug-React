import { create } from 'zustand'
import { fetchMe } from '../../../shared/api/authApi'

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  fetchMe: async () => {
    try {
      const data = await fetchMe()
      set({ user: data, isLoggedIn: true, isLoading: false })
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false })
    }
  },

  clearUser: () => set({ user: null, isLoggedIn: false, isLoading: false }),
}))

export default useAuthStore
