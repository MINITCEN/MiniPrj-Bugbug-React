import { createBrowserRouter } from 'react-router-dom'
import Layout from '../../shared/layouts/Layout'
import MainPage from '../../pages/main/MainPage'
import LoginPage from '../../pages/auth/LoginPage'
import SignupPage from '../../pages/auth/SignupPage'
import ComingSoonPage from '../../pages/common/ComingSoonPage'
import ServiceIntroPage from '../../pages/service-intro/ServiceIntroPage'
import AdminUsersPage from '../../pages/admin/AdminUsersPage'
import AdminApplicationsPage from '../../pages/admin/AdminApplicationsPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/service-intro', element: <ServiceIntroPage /> },
      { path: '/mosquito-map', element: <ComingSoonPage /> },
      { path: '/hunter', element: <ComingSoonPage /> },
      { path: '/requestView/list', element: <ComingSoonPage /> },
      { path: '/requestForm', element: <ComingSoonPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/applications', element: <AdminApplicationsPage /> },
      { path: '/mypage/*', element: <ComingSoonPage /> },
      { path: '*', element: <ComingSoonPage /> },
    ],
  },
])

export default router
