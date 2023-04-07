import getUnicodeFlagIcon from 'country-flag-icons/unicode'

import Badge from '../badge/Badge'
import ServiceState from '../service-state/ServiceState'
const GuildCard = () => {
  return (
    <div className="flex justify-between rounded-sm border border-lightGray bg-white p-4">
      <div className="flex gap-x-2">
        <img
          src="https://www.alohaeos.com/images/bpinfo/aeos-circle-256.png"
          width="32"
          alt="alohaeos"
        />
        <div className="flex flex-col">
          <div>alohaeosprod</div>
          <div className="flex gap-x-1">
            <Badge />
            <span>{getUnicodeFlagIcon('gb')}</span>
          </div>
        </div>
      </div>
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
      <ServiceState />
    </div>
  )
}

export default GuildCard
