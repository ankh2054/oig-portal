import { createBrowserRouter } from 'react-router-dom'

import ErrorPage from './pages/errors/default'
import Guild from './pages/guild/Guild'
import HomePage from './pages/homepage/HomePage'

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
