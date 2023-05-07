import type { ChangeEvent } from 'react'
import { useState } from 'react'

import type {
  LatestResultsResponse,
  ResultsResponse,
  ProducersResponse,
  AvgResultsResponse,
  GuildResult,
} from '../../services/types'
import GuildCard from '../../shared/guild-card/GuildCard'
import IconSearch from '../../shared/icons/IconSearch'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'
import { dayjs } from '../../utils/dates'
import mapProducerToGuild from '../../utils/mapProducerToGuild'

import AvgResults from './AvgResults'

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

  const onSwitch = (showAll: boolean) => {
    setShowAll(showAll)
  }

  const isActive = (owner_name: string) => {
    const owner = producers.find(
      (producer) => producer.owner_name === owner_name
    )
    return owner ? owner.active !== false && owner.active !== null : true
  }

  const activeGuilds = results.filter((r) => isActive(r.owner_name))
  const [guilds, setGuilds] = useState<Array<GuildResult>>(activeGuilds)

  const search = (searchTerm: string) => {
    setGuilds(
      activeGuilds.filter((guild) =>
        guild.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }
  const handleOnSearch = (e: ChangeEvent<HTMLInputElement>) => {
    search(e.target.value)
  }
  const lastCheckFormattedTime = dayjs(results[0].date_check).format(
    'DD MMMM H:mm'
  )
  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="text-2xl">
          Latest results&nbsp;&nbsp;
          <span className="text-xl text-primary">
            @ {lastCheckFormattedTime}
          </span>
        </h3>
        <div className="flex gap-x-8">
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
                className="text-gray-900 border-gray-300 bg-gray-50 block w-full rounded-full border p-2 pl-10 text-sm focus:border-secondary focus:ring-secondary"
                placeholder="Search"
                onChange={handleOnSearch}
                required
              />
            </div>
          </div>
          <div className="flex  gap-x-8">
            <ResultsToggle onClick={onSwitch} showAll={showAll} />
            {action}
          </div>
        </div>
      </div>
      {avgResults && <AvgResults data={avgResults} showAll={showAll} />}
      <div className="grid gap-y-4">
        {guilds.map((v, i) => {
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
    </div>
  )
}

export default GuildsCheckResults
