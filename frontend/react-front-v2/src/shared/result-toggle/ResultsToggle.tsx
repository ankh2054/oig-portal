import cx from 'classnames'

interface Props {
  onClick: (showAll: boolean) => void
  showAll: boolean
}
const ResultsToggle = ({ onClick, showAll }: Props) => {
  return (
    <div className="flex cursor-pointer rounded-full  border border-lightGray bg-white text-gray">
      <button
        className={cx(
          'px-2 py-1',
          {
            'rounded-full bg-gradient-to-r from-redSalsa to-sunsetOrange  font-medium text-white':
              !showAll,
          },
          { 'text-gray': showAll }
        )}
        onClick={() => onClick(false)}
      >
        Results Summary
      </button>
      <button
        className={cx(
          'px-2 py-1',
          {
            'rounded-full bg-gradient-to-r from-redSalsa to-sunsetOrange  font-medium text-white':
              showAll,
          },
          { 'text-gray': !showAll }
        )}
        onClick={() => onClick(true)}
      >
        Full Statistics
      </button>
    </div>
  )
}

export default ResultsToggle
