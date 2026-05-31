import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../../shared/layouts/Layout'
import MainPage from '../../pages/main/MainPage'
import LoginPage from '../../pages/auth/LoginPage'
import SignupPage from '../../pages/auth/SignupPage'
import RequestListPage from '../../pages/request/RequestListPage'
import RequestCreatePage from '../../pages/request/RequestCreatePage'
import ComingSoonPage from '../../pages/common/ComingSoonPage'
import ServiceIntroPage from '../../pages/service-intro/ServiceIntroPage'

// 가드
import RequireAuth from '../../shared/components/auth/RequireAuth'
import RequireRole from '../../shared/components/auth/RequireRole'

// 마이페이지
import MyPageLayout from '../../pages/mypage/MyPageLayout'
import DashboardPage from '../../pages/mypage/DashboardPage'
import MyRequestListPage from '../../pages/mypage/RequestListPage'
import MyReviewListPage from '../../pages/mypage/ReviewListPage'
import MyBookmarkListPage from '../../pages/mypage/BookmarkListPage'
import HunterTaskListPage from '../../pages/mypage/HunterTaskListPage'
import HunterBookmarkListPage from '../../pages/mypage/HunterBookmarkListPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <MainPage /> },

      /**
       * 마이페이지 라우트
       *
       * 구조:
       *  - 부모 element: RequireAuth로 한 번 감싸서 로그인 필수화
       *    그 안에 MyPageLayout (사이드바 + Outlet)
       *  - children: 각 페이지는 USER/HUNTER 권한 가드를 개별로 적용
       *
       * 권한 매트릭스:
       *  | 경로                              | 권한          |
       *  |-----------------------------------|---------------|
       *  | /mypage                          | 인증만 (→ dashboard로 redirect) |
       *  | /mypage/dashboard                | USER + HUNTER |
       *  | /mypage/reviews                  | USER + HUNTER |
       *  | /mypage/requests                 | USER only     |
       *  | /mypage/bookmarks/hunters        | USER only     |
       *  | /mypage/hunter/tasks             | HUNTER only   |
       *  | /mypage/hunter/bookmarks/requests| HUNTER only   |
       *
       * ⚠️ 백엔드 @PreAuthorize와 정확히 일치하도록 유지하세요.
       */
      {
        path: '/mypage',
        element: (
          <RequireAuth>
            <MyPageLayout />
          </RequireAuth>
        ),
        children: [
          // /mypage 진입 시 대시보드로
          { index: true, element: <Navigate to="dashboard" replace /> },

          // 공용 (USER + HUNTER)
          {
            path: 'dashboard',
            element: (
              <RequireRole role={['USER', 'HUNTER']}>
                <DashboardPage />
              </RequireRole>
            ),
          },
          {
            path: 'reviews',
            element: (
              <RequireRole role={['USER', 'HUNTER']}>
                <MyReviewListPage />
              </RequireRole>
            ),
          },

          // USER 전용
          {
            path: 'requests',
            element: (
              <RequireRole role="USER">
                <MyRequestListPage />
              </RequireRole>
            ),
          },
          {
            path: 'bookmarks/hunters',
            element: (
              <RequireRole role="USER">
                <MyBookmarkListPage />
              </RequireRole>
            ),
          },

          // HUNTER 전용
          {
            path: 'hunter/tasks',
            element: (
              <RequireRole role="HUNTER">
                <HunterTaskListPage />
              </RequireRole>
            ),
          },
          {
            path: 'hunter/bookmarks/requests',
            element: (
              <RequireRole role="HUNTER">
                <HunterBookmarkListPage />
              </RequireRole>
            ),
          },
        ],
      },
      { path: '/service-intro', element: <ServiceIntroPage /> },
      { path: '/mosquito-map', element: <ComingSoonPage /> },
      { path: '/hunter', element: <ComingSoonPage /> },
      { path: '/requestView/list', element: <RequestListPage /> },
      { path: '/requestView/new', element: <RequestCreatePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/mypage/*', element: <ComingSoonPage /> },
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
])

export default router