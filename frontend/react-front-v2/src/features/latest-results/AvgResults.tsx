import { Tooltip } from 'react-tooltip'

import type { AvgResultsResponse } from '../../services/types'

interface Props {
  data: AvgResultsResponse
}
const AvgResults = ({ data }: Props) => {
  const getAvgResultItemByKey = (
    count: keyof AvgResultsResponse,
    pct?: keyof AvgResultsResponse
  ) => {
    if (pct) {
      return (
        <div
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
        return <div>{parseInt(data[count] * 100) / 100} </div>
      } else if (count === 'score_avg') {
        return <div>{parseInt(data[count])}</div>
      }
    }
  }
  return (
    <div className="mb-4 flex justify-between bg-secondary bg-opacity-10 p-2">
      {getAvgResultItemByKey('history_v1_count', 'history_v1_pct')}
      {getAvgResultItemByKey('hyperion_v2_count', 'hyperion_v2_pct')}
      {getAvgResultItemByKey('hyperion_v2_full_count', 'hyperion_v2_full_pct')}
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
    </div>
  )
}

export default AvgResults
