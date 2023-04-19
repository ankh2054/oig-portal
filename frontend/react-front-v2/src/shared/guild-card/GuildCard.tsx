import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { Link } from 'react-router-dom'

import type { Guild } from '../../types/Guild'
import datec from '../../utils/datec'
import Badge from '../badge/Badge'
import IconCalendar from '../icons/IconCalendar'
import IconHistory from '../icons/IconHistory'
import ServiceState from '../service-state/ServiceState'
import './GuildCard.css'

interface Props {
  data: Guild
  showAll: boolean
  showTime: boolean
  hideLogo: boolean
}

const GuildCard = ({
  data,
  showAll,
  showTime = false,
  hideLogo = false,
}: Props) => {
  return (
    <Link
      to={`/guilds/${data.owner_name}`}
      className="grid  grid-cols-2 flex-wrap gap-4 gap-x-8 rounded-sm  border border-lightGray bg-white p-4 md:grid-cols-4 md:justify-between lg:auto-cols-max  lg:grid-flow-col"
    >
      {!hideLogo && (
        <div className="flex w-36  gap-x-2">
          {data.logo_svg && (
            <img src={data.logo_svg} className="h-8 self-center" alt="logo" />
          )}
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
      )}

      {!showAll ? (
        <>
          <ServiceState
            icon={<IconHistory />}
            name="History V1"
            status={data.full_history}
            message={data.full_history_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="Hyperion V2"
            status={data.hyperion_v2}
            message={data.hyperion_v2_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="Hyperion V2 full"
            status={data.hyperion_v2_full}
            message={data.hyperion_v2_full_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="hyperion_testnet"
            status={data.hyperion_v2_testnet}
            message={data.hyperion_v2_testnet_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="hyperion_testnet_full"
            status={data.hyperion_v2_testnet_full}
            message={data.hyperion_v2_testnet_full_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="Atomic API"
            status={data.atomic_api}
            message={data.atomic_api_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="cors_check"
            status={data.cors_check}
            message={data.cors_check_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="oracle_feed"
            status={data.oracle_feed}
            message={data.hyperion_v2_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="wwwjson"
            status={data.wwwjson}
            message={data.wwwjson_error}
          />
        </>
      ) : (
        <>
          <ServiceState
            icon={<IconHistory />}
            name="chains_json"
            status={data.chains_json}
          />
          <ServiceState
            icon={<IconHistory />}
            name="wax_json"
            status={data.wax_json}
          />
          <ServiceState
            icon={<IconHistory />}
            name="API"
            status={data.api_node}
            message={data.api_node_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="seed_node"
            status={data.seed_node}
            message={data.seed_node_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="http_check"
            status={data.hyperion_v2_testnet_full}
            message={data.hyperion_v2_testnet_full_error}
          />
          <ServiceState
            icon={<IconHistory />}
            name="https_check"
            status={data.https_check}
            message={data.https_check_error}
          />
          <div className="flex flex-col items-center">
            <div className="relative">1.2</div>
            <div className="text-xs text-gray">tls_ver</div>
          </div>
          <ServiceState
            icon={<IconHistory />}
            name="http2_check"
            status={data.http2_check}
            message={data.http2_check_error}
          />
        </>
      )}
      <div className="flex flex-col items-center">
        <div className="relative">{data.cpu_avg}</div>
        <div className="text-xs text-gray">cpu</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          {Math.round(Number.parseInt(data.score))}
        </div>
        <div className="text-xs text-gray">score</div>
      </div>
      {showTime && (
        <div className="flex flex-col items-center">
          <IconCalendar />
          <div className="text-xs text-gray">{datec(data.date_check)}</div>
        </div>
      )}
    </Link>
  )
}

export default GuildCard
