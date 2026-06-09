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
  toggleSavedHunter,
} from '../api/mypageApi'
import { mypageKeys } from '../api/queryKeys'
import useAuthStore from '../../auth/store/useAuthStore'
import { logout } from '../../../shared/api/authApi'
import { toggleSavedRequest } from '../../../shared/api/requestApi'

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

// 리뷰 CRUD는 백엔드에서 헌터 등급/완료 수를 재산정하므로 헌터 목록 캐시도 함께 무효화한다.
const invalidateReviewRelated = (qc) => {
  qc.invalidateQueries({ queryKey: ['mypage', 'reviews'] })
  qc.invalidateQueries({ queryKey: ['mypage', 'requests'] })
  qc.invalidateQueries({ queryKey: ['hunters'] })
}

/** 리뷰 작성 → 리뷰 목록 + 의뢰 목록(reviewId 채워짐) + 헌터 목록 무효화 */
export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => invalidateReviewRelated(qc),
  })
}

/** 리뷰 수정  args: { reviewId, body } */
export const useUpdateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, body }) => updateReview(reviewId, body),
    onSuccess: () => invalidateReviewRelated(qc),
  })
}

/** 리뷰 삭제 */
export const useDeleteReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => invalidateReviewRelated(qc),
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

/**
 * 헌터 자격 해제 → 자격 해제 직후 강제 로그아웃.
 *
 * 자격 해제는 HUNTER 권한이 사라지는 굵직한 변화라서, 자동으로 USER 마이페이지로
 * 떨어뜨리는 대신 로그인 화면에서 다시 시작하도록 강제한다.
 * 백엔드 세션도 정리해야 다른 권한이 남지 않으므로 logout API 호출 후 redirect.
 */
export const useResignHunter = () => {
  const qc = useQueryClient()
  const clearUser = useAuthStore((s) => s.clearUser)

  return useMutation({
    mutationFn: resignHunter,
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: mypageKeys.all })
      // alert는 동기 블로킹이라 logout/redirect 직전에 호출 — 사용자가 확인 후 진행
      alert('헌터 자격이 해제되었습니다. 로그아웃됩니다.')
      try {
        await logout()
      } catch {
        // 로그아웃 API 실패해도 클라이언트 정리는 강행 — 세션 정리는 다음 진입 시 401로 정리됨
      }
      clearUser()
      window.location.href = '/'
    },
  })
}

/* ───────────── 찜 토글 ───────────── */
 
/**
 * 헌터 찜 토글 (찜하기 / 찜 해제 둘 다).
 * BookmarkListPage에서 찜 해제로 호출.
 */
export const useToggleSavedHunter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleSavedHunter,
    onSuccess: () => {
      // 찜 목록 갱신
      qc.invalidateQueries({ queryKey: ['mypage', 'bookmarks', 'hunters'] })
      // 헌터 상세나 목록 페이지에서도 찜 상태 표시 가능성이 있어 함께 갱신
      qc.invalidateQueries({ queryKey: ['hunters'] })
    },
  })
}
/**
 * 의뢰 찜 토글 (찜하기 / 찜 해제 둘 다).
 * HunterBookmarkListPage에서 찜 해제로 호출.
 *
 * 무효화 대상:
 *  - mypage/hunter/bookmarks/requests : 찜한 의뢰 목록
 *  - savedRequest                     : RequestDetailPage의 찜 상태 (하트 아이콘)
 *  - requestList                      : 의뢰 목록의 찜 표시 가능성
 */
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