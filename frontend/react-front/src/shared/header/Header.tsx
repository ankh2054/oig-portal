import React, { useEffect, useState } from 'react'
import { withUAL } from 'ual-reactjs-renderer'

import type { TransactionProps } from '../../types/Transaction'
import IconPerson from '../icons/IconPerson'
import Logo from '../icons/Logo'

import Avatar from './Avatar'
import NavItem from './NavItem'

const Header = (props: TransactionProps) => {
  const { ual } = props
  const [access_token, setAccessToken] = useState(
    localStorage.getItem('access_token') || ''
  )
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('access_token')
  )
  const [activeUser, setActiveUser] = useState(
    localStorage.getItem('activeUser') || null
  )

  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || null)

  useEffect(() => {
    const user = ual.activeUser
    if (user && !access_token) {
      login(user).then(() => {
        setIsLoggedIn(true)
        setActiveUser(user.accountName)
      })
    }
  }, [ual.activeUser])

  const login = async (user: {
    accountName: any
    signerProof: any
    signerRequest: any
    session: { publicKey: any }
  }) => {
    const accountName = user.accountName
    const signature = user.signerProof
    const signerRequest = user.signerRequest
    const publicKey = user.session.publicKey

    // Sign the message using the active user from Anchor Wallet
    //const signature = signedTransaction.signatures[0];
    //const { signature } = await user.signArbitrary(message);
    //console.log('signature:', signature);

    // Define a service using a base URL and expected endpoints
    const LOGIN_URL =
      import.meta.env.MODE === 'development'
        ? 'http://localhost:3000/login'
        : 'https://wax.sengine.co/login'
    // Call the validate-signature endpoint with the account_name and signed_message
    const response = await fetch(LOGIN_URL, {
      body: JSON.stringify({
        signature: signature,
        transaction: signerRequest,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (response.ok) {
      const data = await response.json()

      // If the login is successful, store the access token and proceed
      if (data.token) {
        setAccessToken(data.token)
        localStorage.setItem('access_token', data.token)
        setIsLoggedIn(true) // set isLoggedIn to true after successful login
        setActiveUser(accountName)
        localStorage.setItem('activeUser', accountName)
        if (data.user?.avatar) {
          setAvatar(data.user.avatar)
          localStorage.setItem('avatar', data.user.avatar)
        }
      } else {
        console.error('Access token is empty')
      }
    } else {
      console.error('Failed to login')
    }
  }
  const handleLogin = async () => {
    if (!isLoggedIn) {
      try {
        await ual.showModal(true)

        // Wait for the activeUser property to be set
        while (!ual.activeUser) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  const handleLogout = async () => {
    try {
      // Logout user from UAL
      await ual.logout()

      // Clear access_token from local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('activeUser')
      localStorage.removeItem('avatar')

      // Reset the state variables
      setAccessToken('')
      setIsLoggedIn(false)
      setActiveUser(null)
      setAvatar(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="left-0 top-0 z-20 w-full items-center  bg-secondary">
      <div className="mx-auto flex h-20 max-w-screen-2xl flex-wrap items-center justify-between p-4 px-8">
        <a href="/" className="flex items-center gap-x-2">
          <Logo width="100%" />
          <span className="self-center whitespace-nowrap text-xl font-medium text-white">
            Scanner
          </span>
        </a>
        <div className="flex gap-x-20">
          <div className="flex md:order-2">
            {!isLoggedIn ? (
              <button
                onClick={() => handleLogin()}
                type="button"
                className="inline-flex hidden items-center rounded-full border  border-white px-4  py-1 text-center text-sm font-medium text-white hover:border-primary hover:bg-primary focus:outline-none md:flex "
              >
                <IconPerson color="white" className="mr-2" />
                Login
              </button>
            ) : (
              <Avatar
                avatarUrl={avatar}
                username={activeUser || ''}
                handleLogout={handleLogout}
              />
            )}
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center rounded-lg p-2 text-sm text-white hover:bg-primary focus:outline-none md:hidden"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div
            className="hidden w-full items-center justify-between uppercase md:order-1 md:flex md:w-auto"
            id="navbar-sticky"
          >
            <ul className="mr-4 flex flex-col md:flex-row md:space-x-8">
              <NavItem title="Home" url="/" />
              <NavItem title="Empty-Blocks" url="/empty-blocks" />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default withUAL(Header)
