import cx from 'classnames'
import { useState } from 'react'

interface Props {
  className?: string
  total: number
  itemsPerPage: number
  onPageClick: (activeIndex: number) => void
}

const Pagination = ({ total, itemsPerPage, onPageClick, className }: Props) => {
  const [activePage, setActivePage] = useState(0)

  const pagesCount = Math.ceil(total / itemsPerPage)
  const handlePageClick = (index: number) => {
    setActivePage(index)
    onPageClick(index)
  }

  const Item = ({ index }: { index: number }) => {
    return (
      <li>
        <button
          onClick={() => handlePageClick(index)}
          className={cx(
            'relative block rounded-sm  px-2 py-0.5 text-sm text-black transition-all duration-300 ',
            { 'bg-primary font-medium text-white': index === activePage },
            {
              'bg-transparent  font-medium text-black hover:bg-neutral-100 hover:text-primary':
                index !== activePage,
            }
          )}
        >
          {index + 1}
        </button>
      </li>
    )
  }

  return (
    <nav aria-label="Page navigation" className={className}>
      <ul className="list-style-none flex items-center gap-x-2 ">
        <li>
          <button
            onClick={() => handlePageClick(activePage - 1)}
            className={cx(
              ' relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300 hover:text-primary',
              { 'pointer-events-none': activePage === 0 }
            )}
          >
            « Previous
          </button>
        </li>
        {[...Array(pagesCount).keys()].map((v) => {
          return <Item index={v} />
        })}
        <li>
          <button
            onClick={() => handlePageClick(activePage + 1)}
            className={cx(
              'relative block rounded-sm bg-transparent px-2 py-0.5 text-sm text-black transition-all duration-300 hover:text-primary',
              { 'pointer-events-none': activePage === pagesCount - 1 }
            )}
          >
            Next »
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
