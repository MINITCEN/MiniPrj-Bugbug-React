
export const mypageKeys = {
  all: ['mypage'],

  myInfo:     ['mypage', 'info'],
  dashboard:  ['mypage', 'dashboard'],
  myReviews:  (page) => ['mypage', 'reviews', { page }],

  myRequests:      (page) => ['mypage', 'requests', { page }],
  mySavedHunters:  (page) => ['mypage', 'bookmarks', 'hunters', { page }],

  hunterTasks:           (page) => ['mypage', 'hunter', 'tasks', { page }],
  hunterSavedRequests:   (page) => ['mypage', 'hunter', 'bookmarks', 'requests', { page }],
  hunterProfile:         ['mypage', 'hunter', 'profile'],
  hunterReviewSummary:   ['mypage', 'hunter', 'review-summary'],
}