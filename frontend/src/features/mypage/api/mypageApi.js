import axiosInstance from '../../../shared/api/axiosInstance'


export const fetchMyInfo = () =>
  axiosInstance.get('/mypage/info').then((res) => res.data)

export const updateMyInfo = (body) =>
  axiosInstance.patch('/mypage/info', body).then((res) => res.data)

export const fetchDashboard = () =>
  axiosInstance.get('/mypage/dashboard').then((res) => res.data)

export const fetchMyReviews = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/reviews', { params: { page, size } })
    .then((res) => res.data)


export const fetchMyRequests = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/requests', { params: { page, size } })
    .then((res) => res.data)

export const fetchMySavedHunters = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/bookmarks/hunters', { params: { page, size } })
    .then((res) => res.data)

export const createReview = (body) =>
  axiosInstance.post('/mypage/reviews', body).then((res) => res.data)


export const updateReview = (reviewId, body) =>
  axiosInstance.put(`/mypage/reviews/${reviewId}`, body).then((res) => res.data)


export const deleteReview = (reviewId) =>
  axiosInstance.delete(`/mypage/reviews/${reviewId}`).then((res) => res.data)


export const applyForHunter = (body) =>
  axiosInstance.post('/mypage/hunter/apply', body).then((res) => res.data)


export const fetchHunterTasks = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/hunter/tasks', { params: { page, size } })
    .then((res) => res.data)


export const fetchHunterSavedRequests = (page = 0, size = 10) =>
  axiosInstance
    .get('/mypage/hunter/bookmarks/requests', { params: { page, size } })
    .then((res) => res.data)


export const resignHunter = () =>
  axiosInstance.post('/mypage/hunter/resign').then((res) => res.data)


export const fetchMyHunterProfile = () =>
  axiosInstance.get('/mypage/hunter/profile').then((res) => res.data)


export const fetchMyHunterReviewSummary = () =>
  axiosInstance.get('/mypage/hunter/review-summary').then((res) => res.data)

 
export const toggleSavedHunter = (hunterId) =>
  axiosInstance.post(`/hunters/${hunterId}/bookmarks`).then((res) => res.data)