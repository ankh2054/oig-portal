import { useState } from 'react'

import {
  useGetLatestResultsQuery,
  useGetProducersQuery,
} from '../../services/api'
import GuildCard from '../../shared/guild-card/GuildCard'
import Pagination from '../../shared/pagination/Pagination'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'
import mapProducerToGuild from '../../utils/mapProducerToGuild'

const Loader = () => {
  return <div className="text-gray">Loading...</div>
}
const LatestResults = () => {
  const [showAll, setShowAll] = useState(false)
  const { data, error, isLoading } = useGetLatestResultsQuery()
  const { data: producersData } = useGetProducersQuery()

  const onSwitch = (showAll: boolean) => {
    setShowAll(showAll)
  }
  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="text-2xl">Latest results</h3>
        <ResultsToggle onClick={onSwitch} showAll={showAll} />
      </div>
      <div className="flex w-full flex-col gap-y-4">
        {error ? (
          <>Oh no, there was an error</>
        ) : isLoading ? (
          <Loader />
        ) : data && producersData ? (
          data.map((v, i) => {
            return (
              <GuildCard
                data={mapProducerToGuild(v, producersData)}
                key={i}
                showAll={showAll}
              />
            )
          })
        ) : (
          false
        )}
      </div>
      <Pagination className="mt-6 flex justify-center" />
    </div>
  )
}

export default LatestResults
