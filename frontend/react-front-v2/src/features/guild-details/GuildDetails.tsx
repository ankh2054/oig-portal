import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import Badge from '../../shared/badge/Badge'
import IconNotion from '../../shared/icons/IconNotion'
import Score from '../../shared/score/Score'

import CpuChart from './CpuChart'

const GuildDetails = () => {
  return (
    <div className="z-10 w-full">
      <div className="grid grid-flow-row grid-cols-3  gap-6">
        <div className="row-start-1 row-end-4">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
              <img
                src="https://hivebp.io/hivebp-logo256.png"
                className="-mt-12 w-16"
                alt=""
              />
              <h3 className="text-lg">waxhiveguild</h3>
              <div className="mb-4 flex items-center gap-x-1">
                <Badge bgColor="bg-success">Top 21</Badge>
                <span className="text-2xl leading-5">
                  {getUnicodeFlagIcon('gb')}
                </span>
              </div>
              <div className="mb-4 flex gap-x-4">
                <Score title="Previous score" score={30} />
                <Score title="Current score" score={100} />
              </div>
              <div className="flex items-center gap-x-8">
                <button className="flex  w-32 items-center justify-center  rounded-full border  border-secondary px-4 py-1 text-center text-sm font-medium text-secondary hover:border-secondary hover:bg-secondary hover:text-white focus:outline-none ">
                  <IconNotion height="16" width="16" /> Notion
                </button>
                <button className="flex w-32 justify-center  rounded-full border bg-gradient-to-r from-redSalsa  to-sunsetOrange px-4 py-1 text-center text-sm font-medium text-white hover:border-primary hover:bg-primary  focus:outline-none">
                  Scan
                </button>
              </div>
            </div>
            <div className=" rounded-sm border border-lightGray bg-white p-4">
              bottom info
            </div>
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
