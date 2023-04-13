import cx from 'classnames'

import IconHistory from '../../shared/icons/IconHistory'

interface ServiceProps {
  state: 'IDLE' | 'ERROR' | 'SUCCESS'
}
const Service = ({ state }: ServiceProps) => {
  return (
    <div className="flex gap-x-2">
      <span className={cx('text-success', { 'text-error': state === 'ERROR' })}>
        <IconHistory />
      </span>{' '}
      History v1
    </div>
  )
}
const Services = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <Service state="SUCCESS" />
      <Service state="ERROR" />
      <Service state="SUCCESS" />
      <Service state="SUCCESS" />
      <Service state="SUCCESS" />
      <Service state="SUCCESS" />
      <Service state="SUCCESS" />
      <Service state="SUCCESS" />
    </div>
  )
}

export default Services
