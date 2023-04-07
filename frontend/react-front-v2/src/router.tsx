import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const ErrorPage = lazy(() => import('./pages/errors/default'))

const Guild = lazy(() => import('./pages/guild/GuildPage'))
const HomePage = lazy(() => import('./pages/homepage/HomePage'))
const router = createBrowserRouter([
  {
    element: <HomePage />,
    errorElement: <ErrorPage />,
    path: '/',
  },
  {
    element: <Guild />,
    path: '/guilds/:guildId',
  },
])

export default router
