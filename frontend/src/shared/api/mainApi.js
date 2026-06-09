import axiosInstance from './axiosInstance'

export const fetchMainStats = () =>
  axiosInstance.get('/main/stats').then((res) => res.data)
