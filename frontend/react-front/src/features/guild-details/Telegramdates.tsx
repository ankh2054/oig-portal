import type { TelegramDates } from '../../services/types'
import IconClockEnd from '../../shared/icons/IconClockEnd'
import IconClockStart from '../../shared/icons/IconClockStart'
import IconScissors from '../../shared/icons/IconScissors'
import IconTrophy from '../../shared/icons/IconTrophy'
import { shortDate } from '../../utils/dates'

interface Props {
  dates: Array<TelegramDates>
}
const Telegramdates = ({ dates }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-lg">OIG dates</h3>
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <IconScissors className="text-secondary" /> Sub cutoff:
        </div>
        <pre className="text-sm text-gray"> {shortDate(dates[0].date)}</pre>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <IconClockStart className="text-secondary" />
          Appeal start:
        </div>
        <pre className="text-sm text-gray">{shortDate(dates[1].date)}</pre>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <IconClockEnd className="text-secondary" />
          Appeal end:
        </div>
        <pre className="text-sm text-gray">{shortDate(dates[2].date)}</pre>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <IconTrophy className="text-secondary" />
          Final report:
        </div>
        <pre className="text-sm text-gray">{shortDate(dates[3].date)}</pre>
      </div>
    </div>
  )
}

export default Telegramdates
