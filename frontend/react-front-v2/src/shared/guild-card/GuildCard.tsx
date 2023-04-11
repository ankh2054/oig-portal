import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import Badge from '../badge/Badge'
import ServiceState from '../service-state/ServiceState'

import './GuildCard.css'
import { Link } from 'react-router-dom'

import IconHistory from '../icons/IconHistory'
import type { Guild } from '../../types/Guild'

interface Props {
  data: Guild
}
const GuildCard = ({ data }: Props) => {
  return (
    <Link
      to="/guilds/1"
      className="flex justify-between rounded-sm border border-lightGray bg-white p-4"
    >
      <div className="flex w-36 gap-x-2">
        <LazyLoadImage
          placeholder={<span>loading</span>}
          src={data.logo_svg}
          className="h-8 self-center"
        />
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
      <ServiceState icon={<IconHistory />} name="history_v1" />
      <ServiceState icon={<span>{data.cpu_avg}</span>} name="cpu" />
      <ServiceState icon={<span>{data.score}</span>} name="score" />
    </Link>
  )
}

export default GuildCard
