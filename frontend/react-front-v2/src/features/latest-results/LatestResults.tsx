import { useEffect, useState } from 'react'

import type {
  GuildResult,
  LatestResultsResponse,
  ResultsResponse,
  ProducersResponse,
} from '../../services/types'
import GuildCard from '../../shared/guild-card/GuildCard'
import Pagination from '../../shared/pagination/Pagination'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'
import mapProducerToGuild from '../../utils/mapProducerToGuild'

const ITEMS_PER_PAGE = 10
interface Props {
  results: ResultsResponse | LatestResultsResponse
  producers: ProducersResponse
  hideLogo: boolean
  showTime: boolean
  action?: JSX.Element
}
const LatestResults = ({
  results,
  producers,
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
    setTotalItems(results.length)
    setPaginatedData(results.slice(itemOffset, itemOffset + ITEMS_PER_PAGE))
  }, [results, itemOffset, totalItems])

  const handlePageClick = (activePage: number) => {
    const newOffset = (activePage * ITEMS_PER_PAGE) % totalItems
    setItemOffset(newOffset)
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
      <div className="flex w-full flex-col gap-y-4">
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

export default LatestResults
