import getUnicodeFlagIcon from 'country-flag-icons/unicode'

import Badge from '../../shared/badge/Badge'

import CpuChart from './CpuChart'

const GuildDetails = () => {
  return (
    <div className="z-10 w-full">
      <div className="grid- grid grid-flow-row grid-cols-3  gap-6">
        <div className="row-start-1 row-end-4">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col items-center gap-y-1 rounded-sm border border-lightGray bg-white p-4">
              <img
                src="https://hivebp.io/hivebp-logo256.png"
                className="-mt-12 w-16"
                alt=""
              />
              <h3 className="text-lg">waxhiveguild</h3>
              <div className="flex items-center gap-x-1">
                <Badge bgColor="bg-success">Top 21</Badge>
                <span className="text-2xl leading-5">
                  {getUnicodeFlagIcon('gb')}
                </span>
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
