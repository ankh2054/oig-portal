import cx from 'classnames'
import { useRef, useState } from 'react'

import useOnClickOutside from '../../hooks/useOnClickOutside'
import IconExpandLess from '../icons/IconExpandLess'
import IconExpandMore from '../icons/IconExpandMore'

interface Props {
  avatarUrl: string
  username: string
  handleLogout: () => void
}
const Avatar = ({ username, avatarUrl, handleLogout }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const handleOnClick = () => setIsOpen(!isOpen)
  useOnClickOutside(ref, () => setIsOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOnClick} className="flex items-center gap-x-2">
        <img
          src={avatarUrl}
          alt={username}
          className="h-10 w-10 rounded rounded-full"
        />
        <span className="text-white">{username}</span>
        {!isOpen && <IconExpandMore color="white" />}
        {isOpen && <IconExpandLess color="white" />}
      </button>
      <ul
        className={cx(
          'divide-gray-100 absolute right-0 top-12  z-10 w-40 divide-y rounded-sm bg-white py-2 shadow',
          { hidden: !isOpen }
        )}
      >
        <li className="px-4 py-2 text-gray hover:text-secondary">
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </div>
  )
}

export default Avatar
