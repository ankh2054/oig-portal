import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useGetAvgResultsQuery,
  useGetLatestResultsQuery,
  useGetProducersQuery,
  useGetResultsQuery,
} from '../../services/api'
import type { Producer } from '../../services/types'
import datec from '../../utils/datec'
import GuildsCheckResults from '../latest-results/GuildsCheckResults'

import CpuChart from './CpuChart'
import GuildInfo from './GuildInfo'
import Services from './Services'

const GuildDetails = () => {
  const [numberOfAverageDays, setNumberOfAverageDays] = useState(30)

  const { guildId } = useParams()
  const { data: producersData, isSuccess } = useGetProducersQuery()
  const { data: results } = useGetResultsQuery({ ownerName: guildId })
  const { data: latestResults } = useGetLatestResultsQuery()
  const { data: avgResults, refetch: refetchAvgResults } =
    useGetAvgResultsQuery({
      numberOfAverageDays: numberOfAverageDays,
      ownerName: guildId,
    })
  let producer: Producer | null = null

  useEffect(() => {
    refetchAvgResults()
  }, [numberOfAverageDays])

  if (isSuccess && producersData) {
    producer = producersData.filter(
      (producer) => producer.owner_name === guildId
    )[0]
  }
  if (!producer)
    return (
      <div
        className="mb-4 h-14 w-full rounded-lg bg-blue-50 p-4 text-secondary"
        role="alert"
      >
        No data recorded for this guild yet.
      </div>
    )
  let chartData = []
  if (latestResults && results) {
    const cpu_avgs = latestResults.map((result) => result.cpu_avg)
    const nonNull_cpu_avgs = cpu_avgs.filter(
      (result) => !!result && result > 0 && result !== '1'
    )
    const aggregate_average =
      nonNull_cpu_avgs.reduce((total, current) => +total + +current, 0) /
      nonNull_cpu_avgs.length
    chartData = results
      .map((result) => {
        return {
          'aggregate average time (all guilds)': aggregate_average.toFixed(2),
          'cpu average time': result.cpu_avg ? result.cpu_avg : null,
          'cpu time': result.cpu_time ? result.cpu_time : null,
          date_check: datec(result.date_check),
        }
      })
      .reverse()
  }

  const updateAverageDays = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (value < 1000) {
      setNumberOfAverageDays(value)
    }
  }

  const AverageDayInput = () => {
    return (
      <div className="flex items-center gap-x-2">
        <label htmlFor="first_name" className="text-sm text-gray">
          Average Days
        </label>
        <input
          type="number"
          max={1000}
          id="first_name"
          onChange={updateAverageDays}
          value={numberOfAverageDays}
          className="w-16 rounded-sm  border border-lightGray p-1 text-sm text-gray focus:border-primary focus:outline-none"
          required
        />
      </div>
    )
  }

  if (results) {
    return (
      <>
        <div className="absolute left-0 right-0 z-0 -mt-14 h-40 border-t border-white border-opacity-20 bg-secondary"></div>
        <div className="z-10 w-full">
          <div className="grid grid-flow-row grid-cols-1 gap-x-6  gap-y-6 md:grid-cols-3 md:gap-y-0">
            <div className="row-start-1 row-end-4">
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
                  <GuildInfo producer={producer} result={results[0]} />
                </div>
                {results && (
                  <div className=" rounded-sm border border-lightGray bg-white p-4">
                    <Services latestResult={results[0]} />
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-sm border border-lightGray bg-white p-4 text-sm md:col-start-2 md:col-end-4">
              <CpuChart data={chartData} />
            </div>
          </div>
          <div className="mt-6">
            <div className="flex w-full flex-col gap-y-4">
              {results && producersData && (
                <GuildsCheckResults
                  results={results}
                  producers={producersData}
                  avgResults={avgResults}
                  hideLogo={true}
                  showTime={true}
                  action={<AverageDayInput />}
                />
              )}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default GuildDetails
