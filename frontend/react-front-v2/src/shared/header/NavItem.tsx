import cx from 'classnames'
import React from 'react'

interface Props {
  title: string
  url: string
  isActive?: boolean
}

const NavItem = ({ title, url, isActive }: Props) => {
  return (
    <li>
      <a
        href={url}
        className={cx('block rounded py-2 pl-3 pr-4 text-white md:p-0', {
          'font-bold': isActive,
        })}
      >
        {title}
      </a>
    </li>
  )
}

export default NavItem
