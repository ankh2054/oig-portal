import cx from 'classnames'
import { useState } from 'react'

import type { Top21Toggle as Top21ToggleType } from '../../types/Top21Toggle'

interface Props {
  onClick: (activeToggle: Top21ToggleType) => void
  showAll: boolean
}

const Top21Toggle = ({ onClick }: Props) => {
  const [activeToggle, setActiveToggle] = useState<Top21ToggleType>('all')
  const handleOnClick = (active: Top21ToggleType) => {
    setActiveToggle(active)
    onClick(active)
  }
  return (
    <div className="flex cursor-pointer rounded-full  border border-secondary bg-white text-gray">
      <button
        className={cx(
          'w-32 px-2 py-1',
          {
            'm-1 rounded-full bg-secondary font-medium text-white':
              activeToggle === 'top21',
          },
          { 'text-gray': activeToggle !== 'top21' }
        )}
        onClick={() => handleOnClick('top21')}
      >
        Only top21
      </button>
      <button
        className={cx(
          'w-32 px-2 py-1',
          {
            'm-1 rounded-full  bg-secondary font-medium text-white':
              activeToggle === 'standby',
          },
          { 'text-gray': activeToggle !== 'standby' }
        )}
        onClick={() => handleOnClick('standby')}
      >
        Only standby
      </button>
      <button
        className={cx(
          'w-32 px-2 py-1',
          {
            'm-1 rounded-full  bg-secondary font-medium text-white':
              activeToggle === 'all',
          },
          { 'text-gray': activeToggle !== 'all' }
        )}
        onClick={() => handleOnClick('all')}
      >
        Show All
      </button>
    </div>
  )
}

export default Top21Toggle
