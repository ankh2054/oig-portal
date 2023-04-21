import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import type {
  LatestResultsResponse,
  ProducersResponse,
  ResultsResponse,
  AvgResultsResponse,
} from './types'

// Define a service using a base URL and expected endpoints
const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001/api'
    : 'https://oig.sentnl.io/api'
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    fetchFn: (...args) => ky(...args),
  }),
  endpoints: (builder) => ({
    getAvgResults: builder.query<
      AvgResultsResponse,
      { ownerName: string; numberOfAverageDays: number }
    >({
      query: (arg) => {
        const { ownerName, numberOfAverageDays } = arg
        return {
          url: `/monthlyaverageresults/${ownerName}?days=${numberOfAverageDays}`,
        }
      },
    }),
    getLatestResults: builder.query<LatestResultsResponse, void>({
      query: () => `/latestresults`,
    }),
    getProducers: builder.query<ProducersResponse, void>({
      query: () => `/producers`,
    }),
    getResults: builder.query<ResultsResponse, { ownerName: string }>({
      query: (arg) => {
        const { ownerName } = arg
        return {
          url: `truncatedPaginatedResults/${ownerName}?index=0&limit=59`,
        }
      },
    }),
    reScan: builder.query<unknown, { ownerName: string }>({
      query: (arg) => {
        const { ownerName } = arg
        return {
          url: `rescan?bp=${ownerName}`,
        }
      },
    }),
  }),
  reducerPath: 'sentnlApi',
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetLatestResultsQuery,
  useGetProducersQuery,
  useGetResultsQuery,
  useGetAvgResultsQuery,
  useLazyReScanQuery,
} = api
