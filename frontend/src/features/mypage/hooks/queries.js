/**
 * 마이페이지 조회 쿼리 훅 모음
 */
import { useQuery } from '@tanstack/react-query'
import {
  fetchMyInfo,
  fetchDashboard,
  fetchMyReviews,
  fetchMyRequests,
  fetchMySavedHunters,
  fetchHunterTasks,
  fetchHunterSavedRequests,
  fetchMyHunterProfile,
  fetchMyHunterReviewSummary,
} from '../api/mypageApi'
import { mypageKeys } from '../api/queryKeys'

/* ───────────── 공용 ───────────── */

export const useMyInfo = () =>
  useQuery({
    queryKey: mypageKeys.myInfo,
    queryFn: fetchMyInfo,
  })

export const useDashboard = () =>
  useQuery({
    queryKey: mypageKeys.dashboard,
    queryFn: fetchDashboard,
  })

export const useMyReviews = (page = 0) =>
  useQuery({
    queryKey: mypageKeys.myReviews(page),
    queryFn: () => fetchMyReviews(page),
    // 페이지네이션 깜빡임 방지
    placeholderData: (prev) => prev,
  })

/* ───────────── USER 전용 ───────────── */

export const useMyRequests = (page = 0) =>
  useQuery({
    queryKey: mypageKeys.myRequests(page),
    queryFn: () => fetchMyRequests(page),
    placeholderData: (prev) => prev,
  })

export const useMySavedHunters = (page = 0) =>
  useQuery({
    queryKey: mypageKeys.mySavedHunters(page),
    queryFn: () => fetchMySavedHunters(page),
    placeholderData: (prev) => prev,
  })

/* ───────────── HUNTER 전용 ───────────── */

export const useHunterTasks = (page = 0) =>
  useQuery({
    queryKey: mypageKeys.hunterTasks(page),
    queryFn: () => fetchHunterTasks(page),
    placeholderData: (prev) => prev,
  })

export const useHunterSavedRequests = (page = 0) =>
  useQuery({
    queryKey: mypageKeys.hunterSavedRequests(page),
    queryFn: () => fetchHunterSavedRequests(page),
    placeholderData: (prev) => prev,
  })

export const useMyHunterProfile = () =>
  useQuery({
    queryKey: mypageKeys.hunterProfile,
    queryFn: fetchMyHunterProfile,
  })

export const useMyHunterReviewSummary = () =>
  useQuery({
    queryKey: mypageKeys.hunterReviewSummary,
    queryFn: fetchMyHunterReviewSummary,
  })