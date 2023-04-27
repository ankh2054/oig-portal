import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React, { useRef, useState } from 'react'

import useOnClickOutside from '../../hooks/useOnClickOutside'
import { useLazyReScanQuery } from '../../services/api'
import type { GuildResult, Producer } from '../../services/types'
import Badge from '../../shared/badge/Badge'
import IconClose from '../../shared/icons/IconClose'
import IconInfo from '../../shared/icons/IconInfo'
import IconNotion from '../../shared/icons/IconNotion'
import Score from '../../shared/score/Score'

interface Props {
  producer: Producer
  result: GuildResult
}
const GuildInfo = ({ producer, result }: Props) => {
  const scanPopupRef = useRef<HTMLDivElement>(null)
  const [rescan] = useLazyReScanQuery()
  const [scanMessage, setScanMessage] = useState('')

  const handleCloseScanPopup = () => {
    setScanMessage('')
  }

  useOnClickOutside(scanPopupRef, handleCloseScanPopup)

  const handleOnScanClick = async () => {
    try {
      const response = await rescan().unwrap()
      setScanMessage(response.message)
      setTimeout(() => {
        setScanMessage('')
      }, 10000)
    } catch (error) {
      // Handle error case here, e.g., show an error message
    }
  }

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
        <Score
          title="Previous score"
          score={parseInt(result.chainscore) / 10000}
        />
        <Score title="Current score" score={parseInt(result.score)} />
      </div>
      <div className="flex items-center gap-x-8">
        <a
          href={producer.notion_url}
          target="_blank"
          className="flex w-32  cursor-pointer items-center justify-center  rounded-full border  border-secondary px-4 py-1 text-center text-sm font-medium text-secondary hover:border-secondary hover:bg-secondary hover:text-white focus:outline-none "
        >
          <IconNotion height="16" width="16" /> Notion
        </a>
        <button
          onClick={handleOnScanClick}
          className="flex w-32 justify-center  rounded-full border bg-gradient-to-r from-redSalsa  to-sunsetOrange px-4 py-1 text-center text-sm font-medium text-white hover:border-primary hover:bg-primary  focus:outline-none"
        >
          Scan
        </button>
      </div>
      {scanMessage && (
        <div
          ref={scanPopupRef}
          className="absolute left-1/2 top-20 flex max-w-2xl -translate-x-1/2 transform  items-center bg-blue-500 py-3 pl-3 pr-7 text-sm font-bold text-white shadow-lg"
          role="alert"
        >
          <div className="flex items-center gap-x-2">
            <IconInfo color="white" />
            <p>{scanMessage}</p>
          </div>
          <button
            onClick={handleCloseScanPopup}
            className="absolute right-1 top-1"
          >
            <IconClose color="white" />
          </button>
        </div>
      )}
    </>
  )
}

export default GuildInfo
