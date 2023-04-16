import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { Link } from 'react-router-dom'

import type { Guild } from '../../types/Guild'
import Badge from '../badge/Badge'
import IconHistory from '../icons/IconHistory'
import ServiceState from '../service-state/ServiceState'
import './GuildCard.css'

interface Props {
  data: Guild
}

const GuildCard = ({ data }: Props) => {
  return (
    <Link
      to={`/guilds/${data.owner_name}`}
      className="flex justify-between rounded-sm border border-lightGray bg-white p-4"
    >
      <div className="flex w-36 gap-x-2">
        <LazyLoadImage src={data.logo_svg} className="h-8 self-center" />
        <div className="flex flex-col gap-y-1">
          <div>{data.owner_name}</div>
          <div className="flex items-center gap-x-1">
            {data.top21 && <Badge bgColor="bg-success">Top 21</Badge>}
            {data.country_code && (
              <span className="text-2xl leading-5">
                {getUnicodeFlagIcon(data.country_code)}
              </span>
            )}
          </div>
        </div>
      </div>
      <ServiceState
        icon={<IconHistory />}
        name="history_v1"
        error={!data.full_history}
        message={data.full_history_error}
      />
      <ServiceState
        icon={<IconHistory />}
        name="hyperion_v2"
        error={!data.hyperion_v2}
        message={data.hyperion_v2_error}
      />
      <div className="flex flex-col items-center">
        <div className="relative">{data.cpu_avg}</div>
        <div className="text-gray">cpu</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">{Number(data.score).toFixed(0)}</div>
        <div className="text-gray">score</div>
      </div>
    </Link>
  )
}

export default GuildCard
