import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import Layout from './pages/Layout'

const ErrorPage = lazy(() => import('./pages/errors/default'))

const Guild = lazy(() => import('./pages/guild/GuildPage'))
const HomePage = lazy(() => import('./pages/homepage/HomePage'))
const EmptyBlocks = lazy(() => import('./pages/emptyblocks/EmptyBlocks'))
const router = createBrowserRouter([
  {
    element: <Layout children={<HomePage />} />,
    errorElement: <ErrorPage />,
    path: '/',
  },
  {
    element: <Layout children={<Guild />} />,
    path: '/guilds/:guildId',
  },
  {
    element: <Layout children={<EmptyBlocks />} />,
    path: '/empty-blocks',
  },
])

export default router
