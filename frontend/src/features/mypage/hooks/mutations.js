/**
 * 마이페이지 mutation 훅 모음
 *
 * 각 mutation은 성공 시 관련 쿼리를 자동으로 무효화하여
 * UI가 최신 상태로 갱신되도록 합니다.
 *
 * role이 바뀌는 mutation(applyForHunter, resignHunter)은
 * useAuthStore.fetchMe()도 함께 호출해서 헤더/사이드바를 갱신해야 합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateMyInfo,
  createReview,
  updateReview,
  deleteReview,
  applyForHunter,
  resignHunter,
} from '../api/mypageApi'
import { mypageKeys } from '../api/queryKeys'
import useAuthStore from '../../auth/store/useAuthStore'

/* ───────────── 공용 ───────────── */

/** 내 정보 수정 → myInfo + dashboard 무효화 + auth store 갱신 */
export const useUpdateMyInfo = () => {
  const qc = useQueryClient()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  return useMutation({
    mutationFn: updateMyInfo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mypageKeys.myInfo })
      qc.invalidateQueries({ queryKey: mypageKeys.dashboard })
      // 닉네임 바뀌면 헤더에도 반영되어야 하므로
      fetchMe()
    },
  })
}

/* ───────────── USER 전용 ───────────── */

/** 리뷰 작성 → 리뷰 목록 + 의뢰 목록(reviewId 채워짐) 무효화 */
export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['mypage', 'requests'] })
    },
  })
}

/** 리뷰 수정  args: { reviewId, body } */
export const useUpdateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, body }) => updateReview(reviewId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['mypage', 'requests'] })
    },
  })
}

/** 리뷰 삭제 */
export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mypage', 'reviews'] })
      qc.invalidateQueries({ queryKey: ['mypage', 'requests'] })
    },
  })
}

/** 헌터 등록 신청 → role 변경되므로 auth store도 갱신 */
export const useApplyForHunter = () => {
  const qc = useQueryClient()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  return useMutation({
    mutationFn: applyForHunter,
    onSuccess: () => {
      // 전체 마이페이지 캐시 갈아엎기 (USER→HUNTER 전환은 보여줄 데이터가 통째로 달라짐)
      qc.invalidateQueries({ queryKey: mypageKeys.all })
      fetchMe()
    },
  })
}

/* ───────────── HUNTER 전용 ───────────── */

/** 헌터 자격 해제 → role 변경되므로 auth store도 갱신 */
export const useResignHunter = () => {
  const qc = useQueryClient()
  const fetchMe = useAuthStore((s) => s.fetchMe)

  return useMutation({
    mutationFn: resignHunter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mypageKeys.all })
      fetchMe()
    },
  })
}