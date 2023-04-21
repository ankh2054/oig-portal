import cx from 'classnames'

import type { GuildResult } from '../../services/types'
import IconApi from '../../shared/icons/IconApi'
import IconAtomic from '../../shared/icons/IconAtomic'
import IconHistory from '../../shared/icons/IconHistory'
import IconHyperionV2 from '../../shared/icons/IconHyperionV2'
import IconShieldLock from '../../shared/icons/IconShieldLock'

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
  icon: JSX.Element
}
const Service = ({ state, name, icon }: ServiceProps) => {
  return (
    <div className="flex gap-x-2">
      <span
        className={cx(
          { 'text-success': state === State.SUCCESS },
          { 'text-error': state === State.ERROR },
          { 'text-gray': state === State.IDLE }
        )}
      >
        {icon}
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
        icon={<IconHistory />}
      />
      <Service
        state={getServiceState(latestResult.hyperion_v2)}
        name="Hyperion V2"
        icon={<IconHyperionV2 />}
      />
      <Service
        state={getServiceState(latestResult.atomic_api)}
        name="Atomic API"
        icon={<IconAtomic />}
      />
      <Service
        state={getServiceState(latestResult.api_node)}
        name="API"
        icon={<IconApi />}
      />
      <Service
        state={State.SUCCESS}
        name="Security"
        icon={<IconShieldLock />}
      />
    </div>
  )
}

export default Services
