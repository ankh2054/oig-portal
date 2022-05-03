import React from "react";
import datec from '../functions/date'

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const cpuSummary = ({ results, latestresults, raw }) => {
  const cpu_avgs = latestresults.map((result) => result.cpu_avg);
  const nonNull_cpu_avgs = cpu_avgs.filter((result) => !!result && result > 0 && result !== "1");
  const aggregate_average = nonNull_cpu_avgs.reduce((total, current) => +total + +current, 0) / nonNull_cpu_avgs.length;
  const data = results.map((result) => { return { date_check: datec(result.date_check), "cpu time": result.cpu_time ? result.cpu_time : null, "cpu average time": result.cpu_avg ? result.cpu_avg : null, "aggregate average time (all guilds)": aggregate_average.toFixed(2) } }).reverse();
  if (raw) {
    return data
  } else {
    return <>
      <p><strong>last 7 days cpu times (ms):</strong> <br/>{data.map(result => result['cpu time'] ? result['cpu time'] : "n/a").join(', ')}</p>
      <p><strong>last 7 days cpu average time (ms):</strong> <br/>{data.map(result => result['cpu average time'] ? result['cpu average time'] : "n/a").join(', ')}</p>
      <p><strong>aggregate average time (all guilds):</strong> <br/>{aggregate_average.toFixed(2)}</p>
    </>
  }
}

const CpuStatsGraph = ({ results, latestresults }) => {
  const data = cpuSummary({ results, latestresults, raw: true })

  return (
    <>
      <ResponsiveContainer aspect={3.5}>
        <AreaChart
          data={data}
          syncId="cpuGraph"
          margin={{ top: 15, right: 15, left: 15 }}
        >
          {/* <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f78e1e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f78e1e" stopOpacity={0} />
            </linearGradient>
          </defs> */}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis label={{ value: 'cpu time (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          {/*<Legend align="left"
          verticalAlign="top" 
          iconType="circle"
          iconSize="16"
          width="215px"
          layout="vertical"
          formatter={(value) => `${value} (ms)`}/>*/}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date_check" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="cpu time" stroke="#f78e1e" fillOpacity={1} fill="url(#colorTime)" />
        </AreaChart>
      </ResponsiveContainer>
      <br></br>
      <ResponsiveContainer aspect={3.5}>
        <AreaChart data={data} syncId="cpuGraph" margin={{ top: 15, right: 15, left: 15 }}>
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
          <YAxis label={{ value: 'avg cpu times (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          {/*<Legend align="left"
          verticalAlign="top" 
          iconType="circle"
          iconSize="16"
          width="215px"
          layout="vertical"
          formatter={(value) => `${value} (ms)`}/>*/}
          <Area type="monotone" dataKey="cpu average time" stroke="#1279FD" fillOpacity={1} fill="url(#colorAvg)" />
          <Area type="monotone" dataKey="aggregate average time (all guilds)" stroke="green" fillOpacity={1} fill="url(#colorAggAvg)" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

export {CpuStatsGraph, cpuSummary};