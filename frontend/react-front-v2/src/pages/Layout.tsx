import type { ReactNode } from 'react'
import React from 'react'

import Container from '../shared/container/Container'
import Footer from '../shared/footer/Footer'
import Header from '../shared/header/Header'

interface Props {
  children: ReactNode
}
const Layout = ({ children }: Props) => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <Container className="flex-grow py-14">{children}</Container>
      <Footer />
    </div>
  )
}

export default Layout
