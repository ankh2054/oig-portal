import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  {
    avgTime: 0.25,
    name: '03/04/23@11:10',
    time: 0.3,
  },
  {
    avgTime: 0.4,
    name: '04/04/23@11:12',
    time: 0.25,
  },
  {
    avgTime: 0.3,
    name: '05/04/23@23:12',
    time: 0.3,
  },
  {
    avgTime: 0.35,
    name: '06/04/23@23:13',
    time: 0.2,
  },
  {
    avgTime: 0.7,
    name: '07/04/23@0:13',
    time: 0.2,
  },
  {
    avgTime: 1,
    name: '8/04/23@0:11',
    time: 0.2,
  },
  {
    avgTime: 0.8,
    name: '9/04/23@21:18',
    time: 0.2,
  },
]

const CpuChart = () => {
  return (
    <div className="flex h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          margin={{
            bottom: 0,
            left: 0,
            right: 30,
            top: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="avgTime"
            stackId="1"
            stroke="#E34B31"
            fill="#E34B31"
          />
          <Area
            type="monotone"
            dataKey="time"
            stackId="1"
            stroke="#5F2BA1"
            fill="#5F2BA1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CpuChart
