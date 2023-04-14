import cx from 'classnames'
import { Tooltip } from 'react-tooltip'
import { v4 as uuidv4 } from 'uuid'
interface Props {
  icon: JSX.Element
  name: string
  error: boolean
  message: string
}
const ServiceState = ({ icon, name, error, message }: Props) => {
  const tooltipId = uuidv4()
  return (
    <div
      className="flex flex-col items-center"
      data-tooltip-id={tooltipId}
      data-tooltip-content={message}
    >
      <div className="relative">
        <span
          className={cx(
            'absolute right-0 top-0 block h-2 w-2 rounded-full ',
            { 'bg-success': !error },
            { 'bg-error': error }
          )}
        ></span>
        {icon}
      </div>
      <div className="text-gray">{name}</div>
      <Tooltip
        id={tooltipId}
        closeOnEsc={true}
        clickable={true}
        positionStrategy="fixed"
        className={cx(
          'border  bg-white text-gray shadow-md',
          { 'border-success': !error },
          { 'border-error': error }
        )}
      />
    </div>
  )
}
export default ServiceState
