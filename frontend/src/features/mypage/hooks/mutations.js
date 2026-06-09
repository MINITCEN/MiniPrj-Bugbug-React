import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateMyInfo,
  createReview,
  updateReview,
  deleteReview,
  applyForHunter,
  resignHunter,
  toggleSavedHunter,
} from '../api/mypageApi'
import { mypageKeys } from '../api/queryKeys'
import useAuthStore from '../../auth/store/useAuthStore'
import { logout } from '../../../shared/api/authApi'
import { toggleSavedRequest } from '../../../shared/api/requestApi'


export const useUpdateMyInfo = () => {
  const qc = useQueryClient()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  return useMutation({
    mutationFn: updateMyInfo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mypageKeys.myInfo })
      qc.invalidateQueries({ queryKey: mypageKeys.dashboard })
      fetchMe()
    },
  })
}

const invalidateReviewRelated = (qc) => {
  qc.invalidateQueries({ queryKey: ['mypage', 'reviews'] })
  qc.invalidateQueries({ queryKey: ['mypage', 'requests'] })
  qc.invalidateQueries({ queryKey: ['hunters'] })
}

export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => invalidateReviewRelated(qc),
  })
}

export const useUpdateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, body }) => updateReview(reviewId, body),
    onSuccess: () => invalidateReviewRelated(qc),
  })
}

export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => invalidateReviewRelated(qc),
  })
}

export const useApplyForHunter = () => {
  const qc = useQueryClient()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  return useMutation({
    mutationFn: applyForHunter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mypageKeys.all })
      fetchMe()
    },
  })
}


export const useResignHunter = () => {
  const qc = useQueryClient()
  const clearUser = useAuthStore((s) => s.clearUser)

  return useMutation({
    mutationFn: resignHunter,
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: mypageKeys.all })
      alert('헌터 자격이 해제되었습니다. 로그아웃됩니다.')
      try {
        await logout()
      } catch {
       
      }
      clearUser()
      window.location.href = '/'
    },
  })
}


export const useToggleSavedHunter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleSavedHunter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'bookmarks', 'hunters'] })
      qc.invalidateQueries({ queryKey: ['hunters'] })
    },
  })
}

export const useToggleSavedRequest = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleSavedRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'hunter', 'bookmarks', 'requests'] })
      qc.invalidateQueries({ queryKey: ['savedRequest'] })
      qc.invalidateQueries({ queryKey: ['requestList'] })
    },
  })
}