import React from 'react'
import './App.css'
import { RouterProvider } from 'react-router-dom'

import router from './router'

const App: React.FC = () => {
  return (
    <main className="App">
      <RouterProvider router={router} />
    </main>
  )
}

export default App
