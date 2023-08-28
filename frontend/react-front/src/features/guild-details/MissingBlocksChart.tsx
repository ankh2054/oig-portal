import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
} from 'recharts'

import { fullDate } from '../../utils/dates'
import './styles.css'

const MissingBlocksChart = ({ data }: { data: Array<{}> }) => {
  const formatXAxis = (date: Date) => fullDate(date)
  return (
    <div className="small-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId="misssedBlockGraph">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis label={{ angle: -90, position: 'insideLeft', value: 'M.B' }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="missed_block_count"
            stroke="#5F2BA1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTime)"
          />

          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#5F2BA1"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="score average"
            stroke="#E34B31"
            label="Missed block count"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MissingBlocksChart
