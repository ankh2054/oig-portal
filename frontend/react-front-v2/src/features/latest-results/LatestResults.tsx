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
  const { data, error, isLoading } = useGetLatestResultsQuery()
  const { data: producersData } = useGetProducersQuery()

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="text-2xl">Latest results</h3>
        <ResultsToggle />
      </div>
      <div className="flex w-full flex-col gap-y-4">
        {error ? (
          <>Oh no, there was an error</>
        ) : isLoading ? (
          <Loader />
        ) : data && producersData ? (
          data.map((v, i) => {
            return (
              <GuildCard data={mapProducerToGuild(v, producersData)} key={i} />
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
