import React, { useState } from 'react'

import { CURRENT_DATE, DATE_LAST_30_DAYS } from '../../consts'
import DateRangePicker from '../../features/guild-details/DateRangePicker'
import { useGetEmptyBlocksResultsQuery } from '../../services/api'
import Breadcrumb from '../../shared/breadcrumb/Breadcrumb'
import { buildEmptyBlocksData } from '../../utils/helpers'

import EmptyBlocksChart from './EmptyBlocksChart/EmptyBlocksChart'
import Producers from './Producers'

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
  if (isLoading)
    return (
      <div
        className="mb-4 h-14 w-full rounded-lg bg-blue-50 p-4 text-sm text-secondary"
        role="alert"
      >
        <span className="font-medium">
          <svg
            aria-hidden="true"
            role="status"
            className="mr-3 inline h-4 w-4 animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
        </span>{' '}
        Loading...
      </div>
    )

  return (
    <>
      <div className="-z-1 absolute left-0 right-0 z-0 -mt-14 h-72 border-t border-white border-opacity-20 bg-secondary"></div>
      <Breadcrumb
        className="z-10 mb-10"
        items={[{ label: 'Empty blocks', url: 'empty-blocks' }]}
      />
      <div className="z-10 w-full">
        <div className="mb-4 flex justify-end">
          <DateRangePicker
            className="rounded-2xl py-2 text-secondary"
            label={{ className: 'text-white' }}
            value={dateRange}
            onChange={(selectedRange) => {
              const [startDate, endDate] = selectedRange
              if (startDate && endDate) {
                setDateRange([startDate, endDate])
              }
            }}
          />
        </div>

        {!emptyBlocksResponse && (
          <div className="mt-44 text-center text-primary">
            There are no empty blocks within the selected date range.
          </div>
        )}
        <div className="grid grid-flow-row grid-cols-1 gap-x-6  gap-y-6 md:grid-cols-3 md:gap-y-0">
          <div className="row-start-1 row-end-4">
            {emptyBlocksResponse && (
              <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
                <h3 className="text-2xl">Empty blocks</h3>
                <Producers items={emptyBlocksResponse} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-6 md:col-start-2 md:col-end-4">
            {emptyBlocksResponse && (
              <div className="rounded-sm border border-lightGray bg-white p-4 text-sm ">
                <EmptyBlocksChart
                  data={buildEmptyBlocksData(emptyBlocksResponse)}
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
