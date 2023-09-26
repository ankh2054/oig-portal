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
} from 'recharts'

const EmptyBlocksChart = ({ data }: { data: Array<{}> }) => {
  return (
    <div className="large-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId="EmptyBlocksChart">
          <defs>
            <linearGradient id="graphColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6E6E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFC1C1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            label={{
              angle: -90,
              position: 'insideLeft',
              value: 'Amount empty',
            }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Empty blocks"
            stroke="#E34B31"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#graphColor)"
            label="Empty blocks"
          />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EmptyBlocksChart
