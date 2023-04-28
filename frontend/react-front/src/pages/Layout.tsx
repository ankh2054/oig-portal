import type { ReactNode } from 'react'
import React from 'react'

import Container from '../shared/container/Container'
import Footer from '../shared/footer/Footer'
import Header from '../shared/header/Header'
import Notification from '../shared/notification/Notification'

interface Props {
  children: ReactNode
}
const Layout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Container className="z-10 w-screen flex-grow px-8 py-14">
        {children}
      </Container>
      <Footer />
      <Notification />
    </div>
  )
}

export default Layout
