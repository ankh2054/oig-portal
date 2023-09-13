import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import type { DateObject } from 'react-multi-date-picker'
import { useParams } from 'react-router-dom'

import {
  useGetAvgResultsQuery,
  useGetLatestResultsQuery,
  useGetProducersQuery,
  useGetResultsQuery,
  useGetTelegramdatesQuery,
  useLazyGetMissingBlocksResultsQuery,
} from '../../services/api'
import type {
  Block,
  LatestResultsResponse,
  Producer,
  ResultsResponse,
  MissingBlocksResponse,
} from '../../services/types'
import Breadcrumb from '../../shared/breadcrumb/Breadcrumb'
import type { ChartDataPoint } from '../../types/ChartDataPoint'
import type { MissedBlocktDataPoint } from '../../types/MissedBlocktDataPoint'
import type { ScoreDataPoint } from '../../types/ScoreDataPoint'
import { fullDate } from '../../utils/dates'
import GuildsCheckResults from '../latest-results/GuildsCheckResults'

import CpuChart from './CpuChart'
import GuildInfo from './GuildInfo'
import MissingBlocksChart from './MissingBlocksChart'
import ScoreChart from './ScoreChart'
import Services from './Services'
import Telegramdates from './Telegramdates'

const GuildDetails = () => {
  const params = useParams<{ guildId: string }>()
  const guildId = params.guildId!

  //TODO:: remove console
  //eslint-disable-next-line no-console
  console.count('got re-rendred ...')

  const [cpuChartData, setCpuChartData] = useState<ChartDataPoint>([])
  const [scoreChartData, setScoreChartData] = useState<ScoreDataPoint>([])
  const [missingBlocks, setMissingBlocks] = useState<MissingBlocksResponse>()
  const { data: producersData, isSuccess } = useGetProducersQuery()
  const { data: results } = useGetResultsQuery({ ownerName: guildId })
  const { data: latestResults } = useGetLatestResultsQuery()
  const { data: telegramDates } = useGetTelegramdatesQuery()
  const { data: avgResults, refetch: refetchAvgResults } =
    useGetAvgResultsQuery({
      endDate: '2023-09-11T22:15:57.000Z',
      ownerName: guildId,
      startDate: '2023-09-11T22:15:57.000Z',
    })

  const [getMissingBlocks] = useLazyGetMissingBlocksResultsQuery()
  let producer: Producer | null = null

  const buildChartData = (
    results: ResultsResponse,
    avgResults: LatestResultsResponse,
    numberOfAverageDays: number
  ): ChartDataPoint => {
    const cpu_avgs = avgResults.map((result) => result.cpu_avg)
    const nonNull_cpu_avgs = cpu_avgs.filter(
      (result) => !!result && result.length > 0 && result !== '1'
    )
    const aggregate_average =
      nonNull_cpu_avgs.reduce((total, current) => +total + +current, 0) /
      nonNull_cpu_avgs.length
    return results
      .map((result) => {
        return {
          'aggregate average time (all guilds)': aggregate_average.toFixed(2),
          'cpu average time': result.cpu_avg ? result.cpu_avg : null,
          'cpu time': result.cpu_time ? result.cpu_time : null,
          date_check: fullDate(result.date_check),
        }
      })
      .reverse()
      .slice(-numberOfAverageDays)
  }

  const buildScoreData = (
    results: ResultsResponse,
    allGuildsAvgResults: LatestResultsResponse,
    numberOfAverageDays: number
  ): ScoreDataPoint => {
    const guildScores = results.map((result) => result.score)
    const nonNullGuildScoreAverage = guildScores.filter(
      (result) => !!result && result.length > 0 && result !== '1'
    )
    const guildScoreAverage =
      nonNullGuildScoreAverage.reduce(
        (total, current) => +total + +current,
        0
      ) / nonNullGuildScoreAverage.length

    const allGuildsScores = allGuildsAvgResults.map((result) => result.score)
    const nonNullAllGuildsScoreAverage = allGuildsScores.filter(
      (result) => !!result && result.length > 0 && result !== '1'
    )
    const aggregateAllGuildsScoreAverage =
      nonNullAllGuildsScoreAverage.reduce(
        (total, current) => +total + +current,
        0
      ) / nonNullAllGuildsScoreAverage.length

    return results
      .map((result) => {
        return {
          'aggregate average score (all guilds)':
            aggregateAllGuildsScoreAverage.toFixed(2),
          date_check: fullDate(result.date_check),
          score: result.score ? result.score : null,
          'score average': guildScoreAverage.toFixed(2),
        }
      })
      .reverse()
      .slice(-numberOfAverageDays)
  }

  const buildMissedBlockData = (data: Array<Block>): MissedBlocktDataPoint => {
    return data.map((item) => {
      return {
        'Missed block count': item.missed_block_count,
        'Missed round': item.round_missed ? 1 : 0,
        date: fullDate(item.date),
      }
    })
  }

  const onDateRangeChange = (dateObj: DateObject | DateObject[] | null) => {
    //TODO:: remove console
    //eslint-disable-next-line no-console
    console.log('dateObj:', dateObj)
    const [start, end] = dateObj
    //TODO:: remove console
    //eslint-disable-next-line no-console 
    console.log('start:', start);

    //TODO:: remove console
    //eslint-disable-next-line no-console
    console.log('end:', end);
    
  }

  useEffect(() => {
    refetchAvgResults()
  }, [])

  useEffect(() => {
    if (latestResults && results) {
      const start = dayjs(new Date())
      const end = dayjs(new Date())
      const daysDifference = end.diff(start, 'day')
      setCpuChartData(buildChartData(results, latestResults, daysDifference))
      setScoreChartData(buildScoreData(results, latestResults, daysDifference))
    }
  }, [latestResults, results])

  useEffect(() => {
    const fetchMissingBlocks = async () => {
      const response = await getMissingBlocks({
        endDate: '2023-09-11T22:15:57.000Z',
        ownerName: guildId,
        startDate: '2023-09-11T22:15:57.000Z',
        top21: !!producer?.top21,
      }).unwrap()
      setMissingBlocks(response)
    }

    fetchMissingBlocks().catch()
  }, [producer])

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

  if (results) {
    return (
      <>
        <div className="-z-1 absolute left-0 right-0 z-0 -mt-14 h-72 border-t border-white border-opacity-20 bg-secondary"></div>
        <Breadcrumb
          className="z-10"
          items={[{ label: producer.owner_name, url: producer.owner_name }]}
        />
        <div className="z-10 mt-14 w-full">
          <div className="grid grid-flow-row grid-cols-1 gap-x-6  gap-y-6 md:grid-cols-3 md:gap-y-0">
            <div className="row-start-1 row-end-4">
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
                  <GuildInfo
                    producer={producer}
                    result={results[0]}
                    reliability={missingBlocks && missingBlocks.reliability}
                    missingBlocks={missingBlocks && missingBlocks.missingBlocks}
                  />
                </div>
                <div className=" rounded-sm border border-lightGray bg-white p-4">
                  {telegramDates && <Telegramdates dates={telegramDates} />}
                </div>
                {results && (
                  <div className=" rounded-sm border border-lightGray bg-white p-4">
                    <Services latestResult={results[0]} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-y-6 md:col-start-2 md:col-end-4">
              <div className="rounded-sm border border-lightGray bg-white p-4 text-sm ">
                <CpuChart data={cpuChartData} />
              </div>
              <div className="rounded-sm border border-lightGray bg-white p-4 text-sm ">
                <ScoreChart data={scoreChartData} />
              </div>
              {missingBlocks && missingBlocks.data && (
                <div className="rounded-sm border border-lightGray bg-white p-4 text-sm ">
                  <MissingBlocksChart
                    data={buildMissedBlockData(missingBlocks.data)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex w-full flex-col gap-y-4">
              {results && producersData && (
                <GuildsCheckResults
                  results={results}
                  producers={producersData}
                  avgResults={avgResults}
                  hideLogo={true}
                  showTime={true}
                  showDateRange={true}
                  onDateRangeChange={onDateRangeChange}
                />
              )}
            </div>
          </div>
        </div>
      </>
    )
  }
  return null
}

export default GuildDetails
