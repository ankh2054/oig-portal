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
import './styles.css'

const MissingBlocksChart = ({ data }: { data: Array<{}> }) => {
  return (
    <div className="small-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId="scoreGraph">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis
            label={{ angle: -90, position: 'insideLeft', value: 'score' }}
          />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#5F2BA1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTime)"
          />
          <Area
            type="monotone"
            dataKey="score average"
            stroke="#E34B31"
            strokeWidth={2}
            fillOpacity={0}
            fill="url(#colorAggAvg)"
          />
          <Area
            type="monotone"
            dataKey="aggregate average score (all guilds)"
            strokeWidth={2}
            stroke="#04CC84"
            fillOpacity={0}
            fill="url(#colorAggAvgAllGuilds)"
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#5F2BA1"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="score average" stroke="#E34B31" />
          <Line
            type="monotone"
            dataKey="aggregate average score (all guilds)"
            stroke="#04CC84"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MissingBlocksChart
