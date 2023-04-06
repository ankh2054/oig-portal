import type { ReactNode } from 'react'
import React from 'react'

import Header from '../shared/header/Header'

interface Props {
  children: ReactNode
}
const Layout = ({ children }: Props) => {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

export default Layout
