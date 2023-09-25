import type {
  Block,
  EmptyBlock,
  EmptyBlocksResponse,
  LatestResultsResponse,
  ResultsResponse,
} from '../services/types'
import type { ChartDataPoint } from '../types/ChartDataPoint'
import type { EmptyBlocksDatePoint } from '../types/EmptyBlocksDatePoint'
import type { MissedBlocktDataPoint } from '../types/MissedBlocktDataPoint'
import type { ScoreDataPoint } from '../types/ScoreDataPoint'

import { fullDate } from './dates'
import { OwnerData } from '../services/types'

export const buildChartData = (
  results: ResultsResponse,
  avgResults: LatestResultsResponse,
  startDate: Date,
  endDate: Date
): ChartDataPoint => {
  const cpu_avgs = avgResults.map((result) => result.cpu_avg)
  const nonNull_cpu_avgs = cpu_avgs.filter(
    (result) => !!result && result.length > 0 && result !== '1'
  )
  const aggregate_average =
    nonNull_cpu_avgs.reduce((total, current) => +total + +current, 0) /
    nonNull_cpu_avgs.length
  return results
    .filter((result) => {
      const resultDate = new Date(result.date_check)
      return resultDate >= startDate && resultDate <= endDate
    })
    .map((result) => {
      return {
        'aggregate average time (all guilds)': aggregate_average.toFixed(2),
        'cpu average time': result.cpu_avg ? result.cpu_avg : null,
        'cpu time': result.cpu_time ? result.cpu_time : null,
        date_check: fullDate(result.date_check),
      }
    })
    .reverse()
}

export const buildScoreData = (
  results: ResultsResponse,
  allGuildsAvgResults: LatestResultsResponse,
  startDate: Date,
  endDate: Date
): ScoreDataPoint => {
  const guildScores = results.map((result) => result.score)
  const nonNullGuildScoreAverage = guildScores.filter(
    (result) => !!result && result.length > 0 && result !== '1'
  )
  const guildScoreAverage =
    nonNullGuildScoreAverage.reduce((total, current) => +total + +current, 0) /
    nonNullGuildScoreAverage.length

  const allGuildsScores = allGuildsAvgResults.map((result) => result.score)
  const nonNullAllGuildsScoreAverage = allGuildsScores.filter(
    (result) => !!result && result.length > 0 && result !== '1'
  )
  const aggregateAllGuildsScoreAverage =
    nonNullAllGuildsScoreAverage.reduce(
      (total, current) => +total + +current,
      0
    ) / nonNullAllGuildsScoreAverage.length

  return results
    .filter((result) => {
      const resultDate = new Date(result.date_check)
      return resultDate >= startDate && resultDate <= endDate
    })
    .map((result) => {
      return {
        'aggregate average score (all guilds)':
          aggregateAllGuildsScoreAverage.toFixed(2),
        date_check: fullDate(result.date_check),
        score: result.score ? result.score : null,
        'score average': guildScoreAverage.toFixed(2),
      }
    })
    .reverse()
}

export const buildMissedBlockData = (
  data: Array<Block>
): MissedBlocktDataPoint => {
  return data.map((item) => {
    return {
      'Missed block count': item.missed_block_count,
      'Missed round': item.round_missed ? 1 : 0,
      date: fullDate(item.date),
    }
  })
}

export const buildEmptyBlocksData = (
  data: OwnerData[]
): EmptyBlocksDatePoint => {
  const groupedData: { [date: string]: number } = {}
  for (const ownerData of data) {
    for (const emptyBlock of ownerData.empty_blocks) {
      // Extract the date portion without hours, minutes, and seconds
      const dateParts = emptyBlock.date.split(' ')[0]

      // Increment the count for this date
      if (groupedData[dateParts]) {
        groupedData[dateParts]++
      } else {
        groupedData[dateParts] = 1
      }
    }
  }

  const result: EmptyBlocksDatePoint = Object.keys(groupedData).map((date) => ({
    'Empty blocks': groupedData[date],
    date,
  }))

  result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })

  return result
}
