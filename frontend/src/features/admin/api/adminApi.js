import axiosInstance from '../../../shared/api/axiosInstance'

/**
 * 관리자 회원 관리 API
 */
export const fetchUsers = (page = 0, size = 10, role = '') => {
  const params = { page, size }
  if (role) params.role = role
  return axiosInstance.get('/admin/users', { params }).then((res) => res.data)
}

export const suspendUser = (userId, days) => {
  return axiosInstance.post(`/admin/users/${userId}/suspend`, null, {
    params: { days },
  }).then((res) => res.data)
}

/**
 * 관리자 헌터 신청 승인 관리 API
 */
export const fetchHunterApplications = (page = 0, size = 10) => {
  return axiosInstance.get('/admin/applications/pending', {
    params: { page, size },
  }).then((res) => res.data)
}

export const approveHunterApplication = (applicationId) => {
  return axiosInstance.post(`/admin/applications/${applicationId}/approve`).then((res) => res.data)
}

export const rejectHunterApplication = (applicationId) => {
  return axiosInstance.post(`/admin/applications/${applicationId}/reject`).then((res) => res.data)
}
