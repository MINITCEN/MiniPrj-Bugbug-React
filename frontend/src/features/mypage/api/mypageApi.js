/**
 * 마이페이지 API
 *
 * 백엔드: com.bug.catcher.domain.mypage.controller.MyPageController
 * Base URL: /api/mypage  (axiosInstance.baseURL이 '/api'이므로 코드상으론 '/mypage'부터 시작)
 *
 * 권한은 백엔드 @PreAuthorize가 1차 방어선이며,
 * 프론트에서는 RequireRole 가드로 UX 차원의 차단만 합니다.
 */

import axiosInstance from '../../../shared/api/axiosInstance'

/* ───────────── 공용 (USER + HUNTER) ───────────── */

/** 내 정보 조회 (대시보드 상단 카드용) */
export const fetchMyInfo = () =>
  axiosInstance.get('/mypage/info').then((res) => res.data)

/** 내 정보 수정 (닉네임 / 전화번호 / 주소) */
export const updateMyInfo = (body) =>
  axiosInstance.patch('/mypage/info', body).then((res) => res.data)

/** 대시보드 진입용 (role + nickname만 반환) */
export const fetchDashboard = () =>
  axiosInstance.get('/mypage/dashboard').then((res) => res.data)

/** 내가 작성한 리뷰 목록 (USER만 작성 가능하지만 HUNTER도 조회는 허용됨) */
export const fetchMyReviews = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/reviews', { params: { page, size } })
    .then((res) => res.data)

/* ───────────── USER 전용 ───────────── */

/** 내가 등록한 의뢰 목록 */
export const fetchMyRequests = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/requests', { params: { page, size } })
    .then((res) => res.data)

/** 내가 찜한 헌터 목록 */
export const fetchMySavedHunters = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/bookmarks/hunters', { params: { page, size } })
    .then((res) => res.data)

/** 리뷰 작성  body: { requestId, hunterId, rating, reviewContent } */
export const createReview = (body) =>
  axiosInstance.post('/mypage/reviews', body).then((res) => res.data)

/** 리뷰 수정  body: { rating, reviewContent } */
export const updateReview = (reviewId, body) =>
  axiosInstance.put(`/mypage/reviews/${reviewId}`, body).then((res) => res.data)

/** 리뷰 삭제 */
export const deleteReview = (reviewId) =>
  axiosInstance.delete(`/mypage/reviews/${reviewId}`).then((res) => res.data)

/** 헌터 등록 신청  body: { pledgeAgreed: true } */
export const applyForHunter = (body) =>
  axiosInstance.post('/mypage/hunter/apply', body).then((res) => res.data)

/* ───────────── HUNTER 전용 ───────────── */

/** 내가 수행한 / 수행 중인 의뢰 목록 */
export const fetchHunterTasks = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/hunter/tasks', { params: { page, size } })
    .then((res) => res.data)

/** 내가 찜한 의뢰 목록 */
export const fetchHunterSavedRequests = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/hunter/bookmarks/requests', { params: { page, size } })
    .then((res) => res.data)

/** 헌터 자격 해제 (USER로 강등) */
export const resignHunter = () =>
  axiosInstance.post('/mypage/hunter/resign').then((res) => res.data)

/** 내 헌터 공개 프로필 (등급 / 활동건수 등) */
export const fetchMyHunterProfile = () =>
  axiosInstance.get('/mypage/hunter/profile').then((res) => res.data)

/** 내 헌터 리뷰 요약 (별점별 카운트 Map<Integer, Long>) */
export const fetchMyHunterReviewSummary = () =>
  axiosInstance.get('/mypage/hunter/review-summary').then((res) => res.data)