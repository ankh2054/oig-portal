import React, { useState } from 'react'

import { CURRENT_DATE, DATE_LAST_30_DAYS } from '../../consts'
import DateRangePicker from '../../features/guild-details/DateRangePicker'
import { useGetEmptyBlocksResultsQuery } from '../../services/api'
import Breadcrumb from '../../shared/breadcrumb/Breadcrumb'
import { buildEmptyBlocksData } from '../../utils/helpers'

import EmptyBlocksChart from './EmptyBlocksChart/EmptyBlocksChart'

const EmptyBlocks = () => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    DATE_LAST_30_DAYS.toDate(),
    CURRENT_DATE.toDate(),
  ])

  const { data: emptyBlocksResponse, isLoading } =
    useGetEmptyBlocksResultsQuery({
      endDate: dateRange[1].toISOString(),
      startDate: dateRange[0].toISOString(),
    })
  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <Breadcrumb
        className="z-10"
        items={[{ label: 'Empty blocks', url: 'empty-blocks' }]}
      />
      <div className="z-10 w-full">
        <div className="grid grid-flow-row grid-cols-1 gap-x-6  gap-y-6 md:grid-cols-3 md:gap-y-0">
          <div className="row-start-1 row-end-4">
            <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
              <h1>Right</h1>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 md:col-start-2 md:col-end-4">
            <DateRangePicker
              value={dateRange}
              onChange={(selectedRange) => {
                const [startDate, endDate] = selectedRange
                if (startDate && endDate) {
                  setDateRange([startDate, endDate])
                }
              }}
            />
            {emptyBlocksResponse && emptyBlocksResponse.data && (
              <div className="rounded-sm border border-lightGray bg-white p-4 text-sm ">
                <EmptyBlocksChart
                  data={buildEmptyBlocksData(emptyBlocksResponse.data)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default EmptyBlocks
