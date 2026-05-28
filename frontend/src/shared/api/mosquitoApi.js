import axiosInstance from './axiosInstance'

// 서울 강남구 기본값 (regionId: 1168000000)
export const fetchMosquitoSummary = (regionId = 1168000000) =>
  axiosInstance.get(`/v1/mosquito/summary/${regionId}`).then((res) => res.data)
