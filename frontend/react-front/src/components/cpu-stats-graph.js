import React from "react";
import moment from "moment";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const CpuStatsGraph = ({ results }) => {
  const data = results.map(result => { return { ...result, date_check: moment(result.date_check).format("D/M @H:mm"), cpu_agg_avg: 0.29 + Math.random()/10 } })

  return (
    <>
      <ResponsiveContainer aspect={3.5}>
        <AreaChart
          data={data}
          syncId="cpuGraph"
          margin={{ top: 15, right: 15 }}
        >
          <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f78e1e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f78e1e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis />
          <Tooltip />
          <Legend />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="cpu_time" stroke="#f78e1e" fillOpacity={1} fill="url(#colorTime)" />
        </AreaChart>
      </ResponsiveContainer>
      <br></br>
      <ResponsiveContainer aspect={3.5}>
        <AreaChart data={data} syncId="cpuGraph" margin={{ top: 15, right: 15 }}>
          <defs>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1279FD" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1279FD" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAggAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="green" stopOpacity={0.8} />
              <stop offset="95%" stopColor="green" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="cpu_avg" stroke="#1279FD" fillOpacity={1} fill="url(#colorAvg)" />
          <Area type="monotone" dataKey="cpu_agg_avg" stroke="green" fillOpacity={1} fill="url(#colorAggAvg)" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

export default CpuStatsGraph;