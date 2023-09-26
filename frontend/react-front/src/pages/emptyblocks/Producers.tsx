import cx from 'classnames'

import type { Owner } from '../../services/types'

interface Props {
  items: Owner[]
}
const ProducersList = ({ items }: Props) => {
  return (
    <div className="flex w-full flex-col divide-y divide-lightGray">
      {items.map((owner) => (
        <div className="flex items-center space-x-4 py-3">
          <div className="flex-shrink-0">
            <img
              className={cx('h-8 w-8 rounded-full', {
                'contrast-0 grayscale filter': !owner.logo,
              })}
              src={owner.logo || '/favicon-32x32.png'}
              alt={owner.owner_name}
            />
          </div>
          <div className="min-w-0 flex-1 text-sm font-medium">
            {owner.owner_name}
          </div>
          <span className="rounded bg-redSalsa bg-opacity-10 px-2.5 py-0.5  text-xs font-medium text-redSalsa">
            {owner.total_empty}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ProducersList
