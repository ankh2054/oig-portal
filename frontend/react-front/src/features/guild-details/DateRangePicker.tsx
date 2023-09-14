import React, { useState } from 'react'
import DatePicker from 'react-datepicker'

import type { DateRange } from '../../types/DateRange'

interface Props {
  value: DateRange
  onChange: (selectedRange: DateRange) => void
}
const DateRangePicker = ({ onChange, value }: Props) => {
  const [dateRange, setDateRange] = useState<DateRange>(value)
  const [startDate, endDate] = dateRange
  return (
    <div className="flex items-center gap-x-2">
      <label htmlFor="date_range" className="text-sm text-gray">
        {' '}
        Date Range:{' '}
      </label>
      <DatePicker
        id="date_range"
        className="w-48 rounded-sm  border border-lightGray p-3 text-sm text-gray focus:border-primary focus:outline-none"
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => {
          setDateRange(update)
          onChange(update)
        }}
        withPortal
      />
    </div>
  )
}

export default DateRangePicker
