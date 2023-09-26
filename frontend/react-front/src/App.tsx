import React, { Suspense } from 'react'
import './App.css'
import { RouterProvider } from 'react-router-dom'

import router from './router'
import { useGetProducersQuery } from './services/api'
import 'react-datepicker/dist/react-datepicker.css'

const Loader = () => {
  return <></>
}
const App: React.FC = () => {
  useGetProducersQuery()

  return (
    <main className="bg-cultured text-black">
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </main>
  )
}

export default App
