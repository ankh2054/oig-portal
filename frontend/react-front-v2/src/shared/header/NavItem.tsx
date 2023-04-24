import cx from 'classnames'
import React from 'react'
import { NavLink } from 'react-router-dom'

interface Props {
  title: string
  url: string
}

const NavItem = ({ title, url }: Props) => {
  return (
    <li>
      <NavLink
        to={url}
        className={({ isActive }) =>
          cx(
            'block rounded py-2 pl-3 pr-4 text-white hover:text-primary md:p-0',
            { 'font-bold': isActive }
          )
        }
      >
        {title}
      </NavLink>
    </li>
  )
}

/**
 *
 * className={cx(
 *           'block rounded py-2 pl-3 pr-4 text-white hover:text-primary md:p-0',
 *           {
 *             'font-bold': isActive,
 *           }
 *         )}**/
export default NavItem
