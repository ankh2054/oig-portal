import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React from 'react'

import type { Producer } from '../../services/types'
import Badge from '../../shared/badge/Badge'
import IconNotion from '../../shared/icons/IconNotion'
import Score from '../../shared/score/Score'

interface Props {
  producer: Producer
}
const GuildInfo = ({ producer }: Props) => {
  return (
    <>
      {producer.logo_svg && (
        <img
          src={producer.logo_svg}
          className="-mt-12 w-16 rounded-full bg-white p-1"
          alt=""
        />
      )}
      <h3 className="text-center text-lg leading-5">
        {producer.candidate} <br />
        <span className="text-sm text-gray">{producer.owner_name}</span>
      </h3>
      <div className="mb-4 flex items-center gap-x-1">
        {producer.top21 && <Badge bgColor="bg-success">Top 21</Badge>}
        {producer.country_code && (
          <span className="text-2xl leading-5">
            {getUnicodeFlagIcon(producer.country_code)}
          </span>
        )}
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
