import { createBrowserRouter } from 'react-router-dom'
import Layout from '../../shared/layouts/Layout'
import MainPage from '../../pages/main/MainPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <MainPage /> },
    ],
  },
])

export default router
