import cx from 'classnames'
import { Tooltip } from 'react-tooltip'
import { v4 as uuidv4 } from 'uuid'
interface Props {
  icon: JSX.Element
  name: string
  status: boolean
  message?: string
  className?: string
}
const ServiceState = ({ icon, name, status, message, className }: Props) => {
  const tooltipId = uuidv4()
  return (
    <div
      className={`flex h-12 flex-col items-center ${className}`}
      data-tooltip-id={tooltipId}
      data-tooltip-content={message}
    >
      <div className="relative">
        <span
          className={cx(
            'absolute right-0 top-0 block h-2 w-2 rounded-full ',
            { 'bg-success': status },
            { 'bg-error': !status }
          )}
        ></span>
        {icon}
      </div>
      <div className="text-center text-xs text-gray">{name}</div>
      <Tooltip
        id={tooltipId}
        closeOnEsc={true}
        clickable={true}
        positionStrategy="fixed"
        className={cx(
          'max-w-sm  break-words border bg-white text-sm text-gray shadow-md',
          { 'border-success': status },
          { 'border-error': !status }
        )}
      />
    </div>
  )
}
export default ServiceState
