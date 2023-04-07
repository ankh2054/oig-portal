import React from 'react'

import IconPerson from '../icons/IconPerson'
import Logo from '../icons/Logo'

import NavItem from './NavItem'

const Header = () => {
  return (
    <nav className="left-0 top-0 z-20 w-full bg-secondary">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-3 px-8">
        <a href="/" className="flex items-center gap-x-2">
          <Logo width="100%" />
          <span className="self-center whitespace-nowrap text-xl font-medium text-white">
            OIG Portal
          </span>
        </a>
        <div className="flex gap-x-20">
          <div className="flex md:order-2">
            <button
              type="button"
              className="inline-flex hidden items-center rounded-full border  border-white px-5  py-2 text-center text-sm font-medium text-white hover:border-primary hover:bg-primary focus:outline-none md:flex "
            >
              <IconPerson color="white" className="mr-2" />
              Login
            </button>
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
            <ul className="flex flex-col md:flex-row md:space-x-8">
              <NavItem title="Home" url="/" isActive={true} />
              <NavItem title="Guilds" url="/guilds" />
              <NavItem title="Latest results" url="/latest-results" />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
