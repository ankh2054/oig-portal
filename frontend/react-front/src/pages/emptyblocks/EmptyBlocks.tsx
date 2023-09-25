import React from 'react'

import GuildInfo from '../../features/guild-details/GuildInfo'
import { useGetEmptyBlocksResultsQuery } from '../../services/api'
import Breadcrumb from '../../shared/breadcrumb/Breadcrumb'
import { buildEmptyBlocksData } from '../../utils/helpers'

import EmptyBlocksChart from './EmptyBlocksChart/EmptyBlocksChart'

const EmptyBlocks = () => {
  const { data: emptyBlocksResponse, isLoading } =
    useGetEmptyBlocksResultsQuery({
      endDate: '2023-09-25T21:14:43.389',
      startDate: '2023-08-23T08:13:34.922',
    })
  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <div className="-z-1 absolute left-0 right-0 z-0 -mt-14 h-72 border-t border-white border-opacity-20 bg-secondary"></div>
      <Breadcrumb
        className="z-10"
        items={[{ label: 'Empty blocks', url: 'empty-blocks' }]}
      />
      <div className="z-10 mt-14 w-full">
        <div className="grid grid-flow-row grid-cols-1 gap-x-6  gap-y-6 md:grid-cols-3 md:gap-y-0">
          <div className="row-start-1 row-end-4">
            <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
              <h1>Right</h1>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 md:col-start-2 md:col-end-4">
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
