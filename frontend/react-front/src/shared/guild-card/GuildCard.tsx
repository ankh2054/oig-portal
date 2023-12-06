import cx from 'classnames'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { Link } from 'react-router-dom'

import type { Guild } from '../../types/Guild'
import { fullDate } from '../../utils/dates'
import Badge from '../badge/Badge'
import IconApi from '../icons/IconApi'
import IconAtomic from '../icons/IconAtomic'
import IconCalendar from '../icons/IconCalendar'
import IconCashCheck from '../icons/IconCashCheck'
import IconCors from '../icons/IconCors'
import IconHyperionV1 from '../icons/IconHyperionV1'
import IconHyperionV2 from '../icons/IconHyperionV2'
import IconHyperionV2TestNet from '../icons/IconHyperionV2TestNet'
import IconImage from '../icons/IconImage'
import IconJson from '../icons/IconJson'
import IconProtocol from '../icons/IconProtocol'
import IconSeedNode from '../icons/IconSeedNode'
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
    <div
      className={cx(
        'lg:grid-cols-  grid grid-cols-2 flex-wrap items-center gap-4  gap-x-8 rounded-sm border border-lightGray bg-white p-4   md:grid-cols-4 md:justify-between ',
        { 'lg:grid-cols-12 ': !showAll },
        { 'lg:grid-cols-11 ': showAll }
      )}
    >
      {!hideLogo && (
        <Link to={`/guilds/${data.owner_name}`} className="flex gap-x-2">
          {data.logo_svg ? (
            <img
              src={data.logo_svg}
              className="h-8 self-center"
              alt="logo"
              width="32"
              height="32"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src =
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgOTYgOTYwIDk2MCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMjAwIDk3NnEtNTAgMC04NS0zNXQtMzUtODVWMjk2cTAtNTAgMzUtODV0ODUtMzVoNTYwcTUwIDAgODUgMzV0MzUgODV2NTYwcTAgNTAtMzUgODV0LTg1IDM1SDIwMFptMC04MGg1NjBxMTcgMCAyOC41LTExLjVUODAwIDg1NlYyOTZxMC0xNy0xMS41LTI4LjVUNzYwIDI1NkgyMDBxLTE3IDAtMjguNSAxMS41VDE2MCAyOTZ2NTYwcTAgMTcgMTEuNSAyOC41VDIwMCA4OTZabTQwLTgwIDE2MC0xNjAgNzIgNzEgODgtMTExIDE2MCAyMDBIMjQwWm04MC0zMjBxLTMzIDAtNTYuNS0yMy41VDI0MCA0MTZxMC0zMyAyMy41LTU2LjVUMzIwIDMzNnEzMyAwIDU2LjUgMjMuNVQ0MDAgNDE2cTAgMzMtMjMuNSA1Ni41VDMyMCA0OTZaIi8+PC9zdmc+'
              }}
            />
          ) : (
            <IconImage
              className="w-8 w-8 rounded rounded-md"
              width="40"
              height="40"
            />
          )}
          <div className="flex flex-col gap-y-1">
            <div>{data.owner_name}</div>
            <div className="flex items-center gap-x-1">
              {data.top21 && (
                <Badge bgColor="bg-success" className="top21-badge">
                  Top 21
                </Badge>
              )}
              {data.country_code && (
                <span className="text-2xl leading-5">
                  {getUnicodeFlagIcon(data.country_code)}
                </span>
              )}
            </div>
          </div>
        </Link>
      )}

      {!showAll ? (
        <>
          <ServiceState
            icon={<IconHyperionV1 />}
            name="History V1"
            status={data.full_history}
            message={data.full_history_error.split('<br>')}
          />
          <ServiceState
            icon={<IconHyperionV2 />}
            name="Hyperion V2"
            status={data.hyperion_v2}
            message={data.hyperion_v2_error}
          />
          <ServiceState
            icon={<IconHyperionV2 />}
            name="Hyperion V2 full"
            status={data.hyperion_v2_full}
            message={data.hyperion_v2_full_error}
          />
          <ServiceState
            icon={<IconHyperionV2TestNet />}
            name="hyperion_testnet"
            status={data.hyperion_v2_testnet}
            message={data.hyperion_v2_testnet_error}
          />
          <ServiceState
            icon={<IconHyperionV2TestNet />}
            name="hyperion_testnet_full"
            status={data.hyperion_v2_testnet_full}
            message={data.hyperion_v2_testnet_full_error}
          />
          <ServiceState
            icon={<IconAtomic />}
            name="Atomic API"
            status={data.atomic_api}
            message={data.atomic_api_error}
          />
          <ServiceState
            icon={<IconCors />}
            name="cors_check"
            status={data.cors_check}
            message={data.cors_check_error}
          />
          <ServiceState
            icon={<IconCashCheck />}
            name="oracle_feed"
            status={data.oracle_feed}
            message={data.oracle_feed_error}
          />
          <ServiceState
            icon={<IconJson />}
            name="wwwjson"
            status={data.wwwjson}
            message={data.wwwjson_error}
          />
        </>
      ) : (
        <>
          <ServiceState
            icon={<IconJson />}
            name="chains_json"
            status={data.chains_json}
          />
          <ServiceState
            icon={<IconJson />}
            name="wax_json"
            status={data.wax_json}
          />
          <ServiceState
            icon={<IconApi />}
            name="API"
            status={data.api_node}
            message={data.api_node_error}
          />
          <ServiceState
            icon={<IconSeedNode />}
            name="seed_node"
            status={data.seed_node}
            message={data.seed_node_error}
          />
          <ServiceState
            icon={<IconProtocol />}
            name="http_check"
            status={data.http_check}
            message={data.http_check_error}
          />
          <ServiceState
            icon={<IconProtocol />}
            name="https_check"
            status={data.https_check}
            message={data.https_check_error}
          />
          <div className="flex flex-col items-center">
            <div
              className={cx(
                'relative font-medium',
                { 'text-success': data.tls_check_error === 'ok' },
                { 'text-error': data.tls_check_error !== 'ok' }
              )}
            >
              {data.tls_check.slice(4, 7)}
            </div>
            <div className="text-xs text-gray">tls_ver</div>
          </div>
          <ServiceState
            icon={<IconProtocol />}
            name="http2_check"
            status={data.http2_check}
            message={data.http2_check_error}
          />
        </>
      )}
      <div className="flex flex-col items-center">
        <div className="relative">{data.cpu_time}</div>
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
          <div className="text-xs text-gray">{fullDate(data.date_check)}</div>
        </div>
      )}
    </div>
  )
}

export default GuildCard
