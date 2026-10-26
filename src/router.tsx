import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router'
import { PublicOnly, RequireAuth } from './auth/guards'
import { AppLayout } from './components/AppLayout'
import { NewsDetailPage } from './features/news/NewsDetailPage'
import { NewsFeedPage } from './features/news/NewsFeedPage'
import { SagasPage } from './features/sagas/SagasPage'
import { SagaStoryPage } from './features/sagas/SagaStoryPage'
import { WantedDetailPage } from './features/wanted/WantedDetailPage'
import { WantedListPage } from './features/wanted/WantedListPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'

function Root() {
  return (
    <>
      {/* Restores the scroll position on back/forward navigation. */}
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage /> },
              // CP2 · Sebastián
              { path: 'wanted', element: <WantedListPage />, children: [{ path: ':id', element: <WantedDetailPage /> }] },
              // CP4 · Camila
              { path: 'news', element: <NewsFeedPage />, children: [{ path: ':id', element: <NewsDetailPage /> }] },
              // CP5 · Ariana
              { path: 'sagas', element: <SagasPage /> },
              { path: 'sagas/:id', element: <SagaStoryPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
