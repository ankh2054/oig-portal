import cx from 'classnames'
import { useRef, useState } from 'react'

import useOnClickOutside from '../../hooks/useOnClickOutside'
import IconExpandLess from '../icons/IconExpandLess'
import IconExpandMore from '../icons/IconExpandMore'
import IconPerson from '../icons/IconPerson'

interface Props {
  avatarUrl: string | null
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
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={username}
            className="h-10 w-10 rounded rounded-full"
          />
        )}

        {!avatarUrl && (
          <span className="flex h-10 w-10 items-center justify-center rounded rounded-full bg-white text-secondary">
            <IconPerson width="32" height="32" color="rgb(95, 43, 161)" />
          </span>
        )}
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
