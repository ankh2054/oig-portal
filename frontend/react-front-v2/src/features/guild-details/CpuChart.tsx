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

const CpuChart = ({ data }: { data: Array<{}> }) => {
  return (
    <div className="cpu-chart flex w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} syncId="cpuGraph">
          <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5F2BA1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#D0C1E8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAggAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6E6E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFC1C1" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="colorAggAvgAllGuilds"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#04CC84" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9DDDC6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis
            label={{ angle: -90, position: 'insideLeft', value: 'time (ms)' }}
          />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="cpu time"
            stroke="#5F2BA1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTime)"
          />
          <Area
            type="monotone"
            dataKey="cpu average time"
            stroke="#E34B31"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAggAvg)"
          />
          <Area
            type="monotone"
            dataKey="aggregate average time (all guilds)"
            strokeWidth={2}
            stroke="#04CC84"
            fillOpacity={1}
            fill="url(#colorAggAvgAllGuilds)"
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cpu time"
            stroke="#5F2BA1"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="cpu average time" stroke="#E34B31" />
          <Line
            type="monotone"
            dataKey="aggregate average time (all guilds)"
            stroke="#04CC84"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CpuChart
