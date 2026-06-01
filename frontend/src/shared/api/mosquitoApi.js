import axiosInstance from './axiosInstance'

export const fetchMosquitoSummary = (regionId = 1168000000) =>
  axiosInstance.get(`/v1/mosquito/summary/${regionId}`).then((res) => res.data)

export const fetchTopMosquito = () =>
  axiosInstance.get('/v1/mosquito/top').then((res) => res.data)

export const fetchMosquitoRegions = () =>
  axiosInstance.get('/v1/mosquito/regions').then((res) => res.data)
