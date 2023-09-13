import type { ChangeEvent } from 'react'
import { memo, useEffect, useState } from 'react'
import type { Value } from 'react-multi-date-picker'
import DatePicker, { DateObject } from 'react-multi-date-picker'

import type {
  LatestResultsResponse,
  ResultsResponse,
  ProducersResponse,
  AvgResultsResponse,
} from '../../services/types'
import GuildCard from '../../shared/guild-card/GuildCard'
import IconSearch from '../../shared/icons/IconSearch'
import Pagination from '../../shared/pagination/Pagination'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'
import Top21Toggle from '../../shared/top21-toggle/Top21Toggle'
import type { Guild } from '../../types/Guild'
import type { Top21Toggle as Top21ToggleType } from '../../types/Top21Toggle'
import { dayjs } from '../../utils/dates'
import mapProducerToGuild from '../../utils/mapProducerToGuild'

import AvgResults from './AvgResults'
interface Props {
  results: ResultsResponse | LatestResultsResponse
  producers: ProducersResponse
  avgResults?: AvgResultsResponse
  hideLogo: boolean
  showTime: boolean
  showDateRange?: boolean
  onDateRangeChange?: (dateObject: DateObject | DateObject[] | null) => void
  filterable?: boolean
}

const ITEMS_PER_PAGE = 15

const GuildsCheckResults = ({
  results,
  producers,
  avgResults,
  hideLogo,
  showTime,
  showDateRange,
  onDateRangeChange,
  filterable,
}: Props) => {
  const [paginatedGuilds, setPaginatedGuilds] = useState<Array<Guild>>([])
  const [itemOffset, setItemOffset] = useState(0)

  const [totalItems, setTotalItems] = useState(0)

  const [values, setValues] = useState<Value>([
    new DateObject().subtract(30, 'days'),
    new DateObject().add(0, 'days'),
  ])
  useEffect(() => {
    const activeGuilds = results.filter((r) => isActive(r.owner_name))
    setTotalItems(activeGuilds.length)
    setPaginatedGuilds(
      activeGuilds
        .slice(itemOffset, itemOffset + ITEMS_PER_PAGE)
        .map((guild) => mapProducerToGuild(producers, guild))
    )
  }, [results, itemOffset, totalItems])

  const handlePageClick = (activePage: number) => {
    const newOffset = (activePage * ITEMS_PER_PAGE) % totalItems
    setItemOffset(newOffset)
  }

  const [showAll, setShowAll] = useState(false)
  const [activeTop21Toggle, setActiveTop21Toggle] =
    useState<Top21ToggleType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const isActive = (owner_name: string) => {
    const owner = producers.find(
      (producer) => producer.owner_name === owner_name
    )
    return owner ? owner.active !== false && owner.active !== null : true
  }

  const activeGuilds = results
    .filter((r) => isActive(r.owner_name))
    .map((guild) => mapProducerToGuild(producers, guild))

  const [filterableGuilds, setFilterableGuilds] =
    useState<Array<Guild>>(activeGuilds)

  const onColumnsSwitch = (showAll: boolean) => {
    setShowAll(showAll)
  }

  const getGuildsToggle = (activeToggle: Top21ToggleType) => {
    let guilds
    if (activeToggle === 'top21') {
      guilds = activeGuilds.filter((guild) => guild.top21 === true)
    } else if (activeToggle === 'standby') {
      guilds = activeGuilds.filter((guild) => guild.top21 !== true)
    } else {
      guilds = activeGuilds
    }
    return guilds
  }

  const onTop21Switch = (activeToggle: Top21ToggleType) => {
    setActiveTop21Toggle(activeToggle)
    let guilds = getGuildsToggle(activeToggle)
    guilds = guilds.filter((guild) =>
      guild.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilterableGuilds(guilds)
  }

  const search = (searchTerm: string) => {
    let guildResult = getGuildsToggle(activeTop21Toggle)
    setSearchTerm(searchTerm.trim())
    if (searchTerm.trim().length === 0) {
      setFilterableGuilds(guildResult)
    }
    setFilterableGuilds(
      guildResult.filter((guild) =>
        guild.owner_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
    )
  }
  const handleOnSearch = (e: ChangeEvent<HTMLInputElement>) => {
    search(e.target.value)
  }
  const lastCheckFormattedTime = dayjs(results[0].date_check).format(
    'DD MMMM H:mm'
  )

  const guildsToDisplay = filterable ? filterableGuilds : paginatedGuilds

  const DateRange = () => {
    return (
      <div className="flex items-center gap-x-2">
        <label htmlFor="dateRange" className="text-sm text-gray">
          Date range
        </label>
        <DatePicker
          id="dateRange"
          value={values}
          onChange={(dateObject) => {
            setValues(dateObject)
            if (onDateRangeChange) {
              onDateRangeChange(dateObject)
            }
          }}
          range
        />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl">
          Latest results&nbsp;&nbsp;
          <span className="text-xl text-primary">
            @ {lastCheckFormattedTime}
          </span>
        </h3>

        <div className="flex  gap-x-4">
          {filterable && (
            <>
              <div>
                <label
                  htmlFor="search"
                  className="text-gray-900 sr-only mb-2 text-sm font-medium"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <IconSearch className="h-5 w-5 text-gray" />
                  </div>
                  <input
                    type="search"
                    id="search"
                    className="text-gray-900 block w-full rounded-full border border-lightGray py-2.5 pl-10  text-sm focus:border-secondary focus:ring-secondary"
                    placeholder="Search"
                    onChange={handleOnSearch}
                    required
                  />
                </div>
              </div>
              <Top21Toggle onClick={onTop21Switch} showAll={showAll} />
            </>
          )}
          <ResultsToggle onClick={onColumnsSwitch} showAll={showAll} />
          {showDateRange && <DateRange />}
        </div>
      </div>
      {avgResults && <AvgResults data={avgResults} showAll={showAll} />}
      <div className="grid gap-y-4">
        {guildsToDisplay.map((guild) => {
          return (
            <GuildCard
              data={guild}
              key={guild.owner_name}
              showAll={showAll}
              hideLogo={hideLogo}
              showTime={showTime}
            />
          )
        })}
      </div>
      {!filterable && totalItems > ITEMS_PER_PAGE && (
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

export default memo(GuildsCheckResults)
