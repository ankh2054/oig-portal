import React from "react";

import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line
} from "recharts";

const CpuStatsGraph = ({ results }) => {
  return (
    <>
      <LineChart
        width={750}
        height={300}
        data={results}
        syncId="cpuGraph"
        margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date_check" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cpu_time" stroke="blue" />
      </LineChart>
      <LineChart
        width={750}
        height={300}
        data={results}
        syncId="cpuGraph"
        margin={{ top: 25, right: 25, left: 25, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date_check" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cpu_avg" stroke="green" />
      </LineChart>
    </>
  );
}

export default CpuStatsGraph;