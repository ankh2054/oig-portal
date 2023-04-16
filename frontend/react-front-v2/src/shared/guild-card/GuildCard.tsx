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
  showAll: boolean
}

const GuildCard = ({ data, showAll }: Props) => {
  return (
    <Link
      to={`/guilds/${data.owner_name}`}
      className="flex items-center justify-between rounded-sm border border-lightGray bg-white p-4"
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
      <div className="flex flex-col ">
        <div className="flex gap-x-4">
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
        </div>
        {showAll && (
          <>
            <hr className="my-4 h-px border-t-0 bg-lightGray" />
            <div className="flex gap-x-4 pt-2">
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
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">{data.cpu_avg}</div>
        <div className="text-xs text-gray">cpu</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">{Number(data.score).toFixed(0)}</div>
        <div className="text-xs text-gray">score</div>
      </div>
    </Link>
  )
}

export default GuildCard
