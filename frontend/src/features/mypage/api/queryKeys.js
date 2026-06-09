/**
 * react-query queryKey 모음
 *
 * 캐시 무효화(invalidateQueries) 시 키 오타로 버그 나는 걸 방지하기 위해
 * 한 곳에서 관리합니다.
 *
 * 사용 예:
 *   useQuery({ queryKey: mypageKeys.myInfo, queryFn: fetchMyInfo })
 *   queryClient.invalidateQueries({ queryKey: mypageKeys.myInfo })
 */
export const mypageKeys = {
  /** 모든 마이페이지 쿼리의 부모 키 (전체 invalidate용) */
  all: ['mypage'],

  // 공용
  myInfo:     ['mypage', 'info'],
  dashboard:  ['mypage', 'dashboard'],
  myReviews:  (page) => ['mypage', 'reviews', { page }],

  // USER 전용
  myRequests:      (page) => ['mypage', 'requests', { page }],
  mySavedHunters:  (page) => ['mypage', 'bookmarks', 'hunters', { page }],

  // HUNTER 전용
  hunterTasks:           (page) => ['mypage', 'hunter', 'tasks', { page }],
  hunterSavedRequests:   (page) => ['mypage', 'hunter', 'bookmarks', 'requests', { page }],
  hunterProfile:         ['mypage', 'hunter', 'profile'],
  hunterReviewSummary:   ['mypage', 'hunter', 'review-summary'],
}