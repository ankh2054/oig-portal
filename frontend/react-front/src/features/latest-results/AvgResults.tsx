import cx from 'classnames'
import { Tooltip } from 'react-tooltip'

import type { AvgResultsResponse } from '../../services/types'

interface Props {
  data: AvgResultsResponse
  showAll: boolean
}
const AvgResults = ({ data, showAll }: Props) => {
  const getAvgResultItemByKey = (
    count: keyof AvgResultsResponse,
    pct?: keyof AvgResultsResponse
  ) => {
    if (pct) {
      return (
        <div
          className="text-center"
          data-tooltip-id="history_v1"
          data-tooltip-content={`${data[count]}/${data.total_count}`}
        >
          {data[pct]}
          <Tooltip
            id="history_v1"
            closeOnEsc={true}
            clickable={true}
            positionStrategy="fixed"
            className="border-light  border bg-white text-gray shadow-md"
          />
        </div>
      )
    } else {
      if (count === 'cpu_time') {
        return (
          <div className="text-center">
            {Number(data[count]).toPrecision(2)}
          </div>
        )
      } else if (count === 'score_avg') {
        return <div className="text-center">{parseInt(data[count])}</div>
      }
    }
  }
  return (
    <div
      className={cx(
        'lg:grid-cols- mb-2 flex grid grid-cols-2 flex-wrap items-center justify-between gap-4  gap-x-8 rounded-sm border border-lightGray bg-secondary  bg-opacity-10 p-2  font-medium text-secondary   md:grid-cols-4 md:justify-between ',
        { 'lg:grid-cols-12 ': !showAll },
        { 'lg:grid-cols-11 ': showAll }
      )}
    >
      {showAll ? (
        <>
          {getAvgResultItemByKey('chains_json_count', 'chains_json_pct')}
          {getAvgResultItemByKey('wax_json_count', 'wax_json_pct')}
          {getAvgResultItemByKey('api_node_count', 'api_node_pct')}
          {getAvgResultItemByKey('seed_node_count', 'seed_node_pct')}
          {getAvgResultItemByKey('http_check_count', 'http_check_pct')}
          {getAvgResultItemByKey('https_check_count', 'https_check_pct')}
          {getAvgResultItemByKey('tls_ver_count', 'tls_ver_pct')}
          {getAvgResultItemByKey('http2_check_count', 'http2_check_pct')}
          {getAvgResultItemByKey('cpu_time')}
          {getAvgResultItemByKey('score_avg')}
        </>
      ) : (
        <>
          {getAvgResultItemByKey('history_v1_count', 'history_v1_pct')}
          {getAvgResultItemByKey('hyperion_v2_count', 'hyperion_v2_pct')}
          {getAvgResultItemByKey(
            'hyperion_v2_full_count',
            'hyperion_v2_full_pct'
          )}
          {getAvgResultItemByKey(
            'hyperion_v2_testnet_count',
            'hyperion_v2_testnet_pct'
          )}
          {getAvgResultItemByKey(
            'hyperion_v2_testnet_full_count',
            'hyperion_v2_testnet_full_pct'
          )}
          {getAvgResultItemByKey('atomic_api_count', 'atomic_api_pct')}
          {getAvgResultItemByKey('cors_check_count', 'cors_check_pct')}
          {getAvgResultItemByKey('oracle_feed_count', 'oracle_feed_pct')}
          {getAvgResultItemByKey('wwwjson_count', 'wwwjson_pct')}
          {getAvgResultItemByKey('cpu_time')}
          {getAvgResultItemByKey('score_avg')}
        </>
      )}
    </div>
  )
}

export default AvgResults
