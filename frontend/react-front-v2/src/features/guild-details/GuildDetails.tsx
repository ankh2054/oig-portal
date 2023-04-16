import React from 'react'
import { useParams } from 'react-router-dom'

import { useGetProducersQuery, useGetResultsQuery } from '../../services/api'
import type { Producer } from '../../services/types'

import CpuChart from './CpuChart'
import GuildInfo from './GuildInfo'
import Services from './Services'

const GuildDetails = () => {
  const { guildId } = useParams()
  const { data: producersData, isSuccess } = useGetProducersQuery()
  const { data: resultsData } = useGetResultsQuery({ ownerName: guildId })

  let producer: Producer | null = null

  if (isSuccess) {
    producer = producersData.filter(
      (producer) => producer.owner_name === guildId
    )[0]
  }
  if (!producer) return null
  return (
    <div className="z-10 w-full">
      <div className="grid grid-flow-row grid-cols-3  gap-6">
        <div className="row-start-1 row-end-4">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
              <GuildInfo producer={producer} />
            </div>
            {resultsData && (
              <div className=" rounded-sm border border-lightGray bg-white p-4">
                <Services latestResult={resultsData[0]} />
              </div>
            )}
          </div>
        </div>
        <div className="col-start-2 col-end-4 rounded-sm border border-lightGray bg-white p-4">
          <CpuChart />
        </div>
      </div>
    </div>
  )
}

export default GuildDetails
