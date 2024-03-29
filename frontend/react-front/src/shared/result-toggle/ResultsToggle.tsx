import cx from 'classnames'

interface Props {
  onClick: (showAll: boolean) => void
  showAll: boolean
}
const ResultsToggle = ({ onClick, showAll }: Props) => {
  return (
    <div className="flex cursor-pointer rounded-full  border border-primary bg-white text-gray">
      <button
        className={cx(
          'w-32 px-2 py-1',
          {
            'm-1 rounded-full bg-gradient-to-r  from-redSalsa to-sunsetOrange font-medium text-white ':
              !showAll,
          },
          { 'text-gray': showAll }
        )}
        onClick={() => onClick(false)}
      >
        Services
      </button>
      <button
        className={cx(
          'w-32 px-2 py-1',
          {
            'm-1 rounded-full bg-gradient-to-r from-redSalsa  to-sunsetOrange font-medium  text-white ':
              showAll,
          },
          { 'text-gray': !showAll }
        )}
        onClick={() => onClick(true)}
      >
        Requirements
      </button>
    </div>
  )
}

export default ResultsToggle
