import cx from 'classnames'

import type { GuildResult } from '../../services/types'
import IconHistory from '../../shared/icons/IconHistory'

enum State {
  IDLE = 'IDLE',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}
const getServiceState = (state: boolean): State =>
  state ? State.SUCCESS : !state ? State.ERROR : State.IDLE

interface ServiceProps {
  state: State
  name: string
}
const Service = ({ state, name }: ServiceProps) => {
  return (
    <div className="flex gap-x-2">
      <span
        className={cx(
          { 'text-success': state === State.SUCCESS },
          { 'text-error': state === State.ERROR },
          { 'text-gray': state === State.IDLE }
        )}
      >
        <IconHistory />
      </span>
      &nbsp;{name}
    </div>
  )
}

interface ServicesProps {
  latestResult: GuildResult
}
const Services = ({ latestResult }: ServicesProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-lg">Services Provided</h3>
      <Service
        state={getServiceState(latestResult.full_history)}
        name="History V1"
      />
      <Service
        state={getServiceState(latestResult.hyperion_v2)}
        name="Hyperion V2"
      />
      <Service
        state={getServiceState(latestResult.atomic_api)}
        name="Atomic API"
      />
      <Service state={getServiceState(latestResult.api_node)} name="API" />
      <Service state={State.IDLE} name="Missed Blocks (24 hours)" />
      <Service state={State.SUCCESS} name="Security" />
    </div>
  )
}

export default Services
