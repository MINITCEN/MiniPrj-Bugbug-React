// [Vite 환경 호환성 패치] 다른 모든 라이브러리(특히 sockjs-client)가 로드되기 전에 
// 브라우저 전역 객체인 'window.global'을 먼저 세팅해야 ReferenceError를 방지할 수 있습니다.
import './polyfill'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import QueryProvider from './app/providers/QueryProvider'
import router from './app/router'
import './shared/styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
)
