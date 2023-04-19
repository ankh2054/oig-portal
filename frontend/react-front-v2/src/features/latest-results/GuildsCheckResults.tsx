import { useEffect, useState } from 'react'

import type {
  GuildResult,
  LatestResultsResponse,
  ResultsResponse,
  ProducersResponse,
  AvgResultsResponse,
} from '../../services/types'
import GuildCard from '../../shared/guild-card/GuildCard'
import Pagination from '../../shared/pagination/Pagination'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'
import mapProducerToGuild from '../../utils/mapProducerToGuild'

import AvgResults from './AvgResults'

const ITEMS_PER_PAGE = 10
interface Props {
  results: ResultsResponse | LatestResultsResponse
  producers: ProducersResponse
  avgResults?: AvgResultsResponse
  hideLogo: boolean
  showTime: boolean
  action?: JSX.Element
}
const GuildsCheckResults = ({
  results,
  producers,
  avgResults,
  hideLogo,
  showTime,
  action,
}: Props) => {
  const [showAll, setShowAll] = useState(false)
  const [paginatedData, setPaginatedData] = useState<Array<GuildResult>>([])
  const [itemOffset, setItemOffset] = useState(0)

  const [totalItems, setTotalItems] = useState(0)
  const onSwitch = (showAll: boolean) => {
    setShowAll(showAll)
  }

  useEffect(() => {
    const activeGuilds = results.filter((r) => isActive(r.owner_name))
    setTotalItems(activeGuilds.length)
    setPaginatedData(
      activeGuilds.slice(itemOffset, itemOffset + ITEMS_PER_PAGE)
    )
  }, [results, itemOffset, totalItems])

  const handlePageClick = (activePage: number) => {
    const newOffset = (activePage * ITEMS_PER_PAGE) % totalItems
    setItemOffset(newOffset)
  }

  const isActive = (owner_name: string) => {
    const owner = producers.find(
      (producer) => producer.owner_name === owner_name
    )
    return owner ? owner.active !== false && owner.active !== null : true
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="text-2xl">Latest results</h3>
        <div className="flex  gap-x-8">
          <ResultsToggle onClick={onSwitch} showAll={showAll} />
          {action}
        </div>
      </div>
      {avgResults && <AvgResults data={avgResults} />}
      <div className="grid gap-y-4">
        {paginatedData.map((v, i) => {
          return (
            <GuildCard
              data={mapProducerToGuild(v, producers)}
              key={i}
              showAll={showAll}
              hideLogo={hideLogo}
              showTime={showTime}
            />
          )
        })}
      </div>
      {totalItems > ITEMS_PER_PAGE && (
        <Pagination
          className="mt-6 flex justify-center"
          total={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageClick={handlePageClick}
        />
      )}
    </div>
  )
}

export default GuildsCheckResults
