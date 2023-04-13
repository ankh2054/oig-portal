import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import Badge from '../../shared/badge/Badge'
import IconNotion from '../../shared/icons/IconNotion'
import Score from '../../shared/score/Score'

const GuildInfo = () => {
  return (
    <>
      <img
        src="https://hivebp.io/hivebp-logo256.png"
        className="-mt-12 w-16"
        alt=""
      />
      <h3 className="text-lg">waxhiveguild</h3>
      <div className="mb-4 flex items-center gap-x-1">
        <Badge bgColor="bg-success">Top 21</Badge>
        <span className="text-2xl leading-5">{getUnicodeFlagIcon('gb')}</span>
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
    </>
  )
}

export default GuildInfo
