import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useGetAvgResultsQuery,
  useGetLatestResultsQuery,
  useGetProducersQuery,
  useGetResultsQuery,
  useGetTelegramdatesQuery,
  useLazyGetMissingBlocksResultsQuery,
} from '../../services/api'
import type { Producer, MissingBlocksResponse } from '../../services/types'
import Breadcrumb from '../../shared/breadcrumb/Breadcrumb'
import type { ChartDataPoint } from '../../types/ChartDataPoint'
import type { ScoreDataPoint } from '../../types/ScoreDataPoint'
import { dayjs } from '../../utils/dates'
import {
  buildChartData,
  buildMissedBlockData,
  buildScoreData,
} from '../../utils/helpers'
import GuildsCheckResults from '../latest-results/GuildsCheckResults'

import CpuChart from './CpuChart'
import DateRangePicker from './DateRangePicker'
import GuildInfo from './GuildInfo'
import MissingBlocksChart from './MissingBlocksChart'
import ScoreChart from './ScoreChart'
import Services from './Services'
import Telegramdates from './Telegramdates'

import 'react-datepicker/dist/react-datepicker.css'
const GuildDetails = () => {
  const currentDate = dayjs()
  const dateLast30Days = currentDate.subtract(30, 'day')

  const params = useParams<{ guildId: string }>()
  const guildId = params.guildId!
  const [cpuChartData, setCpuChartData] = useState<ChartDataPoint>([])
  const [scoreChartData, setScoreChartData] = useState<ScoreDataPoint>([])
  const [missingBlocks, setMissingBlocks] = useState<MissingBlocksResponse>()
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    dateLast30Days.toDate(),
    currentDate.toDate(),
  ])

  const { data: producersData, isSuccess } = useGetProducersQuery()
  const { data: results } = useGetResultsQuery({ ownerName: guildId })
  const { data: latestResults } = useGetLatestResultsQuery()
  const { data: telegramDates } = useGetTelegramdatesQuery()
  const { data: avgResults, refetch: refetchAvgResults } =
    useGetAvgResultsQuery({
      endDate: dateRange[1].toISOString(),
      ownerName: guildId,
      startDate: dateRange[0].toISOString(),
    })

  const [getMissingBlocks] = useLazyGetMissingBlocksResultsQuery()
  let producer: Producer | null = null

  useEffect(() => {
    refetchAvgResults()
  }, [dateRange])

  useEffect(() => {
    if (latestResults && results && dateRange) {
      const [startDate, endDate] = dateRange
      setCpuChartData(
        buildChartData(results, latestResults, startDate, endDate)
      )
      setScoreChartData(
        buildScoreData(results, latestResults, startDate, endDate)
      )
    }
  }, [latestResults, results, dateRange])

  useEffect(() => {
    const fetchMissingBlocks = async () => {
      const response = await getMissingBlocks({
        endDate: dateRange[0].toISOString(),
        ownerName: guildId,
        startDate: dateRange[0].toISOString(),
        top21: !!producer?.top21,
      }).unwrap()
      setMissingBlocks(response)
    }

    fetchMissingBlocks().catch()
  }, [dateRange, producer])

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
                  action={
                    <DateRangePicker
                      value={dateRange}
                      onChange={(selectedRange) => {
                        const [startDate, endDate] = selectedRange
                        if (startDate && endDate) {
                          setDateRange([startDate, endDate])
                        }
                      }}
                    />
                  }
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
