import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import type {
  LatestResultsResponse,
  ProducersResponse,
  ResultsResponse,
  MissingBlocksResponse,
  AvgResultsResponse,
  TelegramDatesResponse,
} from './types'

// Define a service using a base URL and expected endpoints.
const BASE_URL =
  import.meta.env.MODE !== 'development'
    ? 'http://localhost:3000/api'
    : 'https://wax.sengine.co/api' //'https://oigstage.sentnl.io/api'
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    fetchFn: (...args) => ky(...args),
    prepareHeaders: (headers) => {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    getAvgResults: builder.query<
      AvgResultsResponse,
      { ownerName: string; startDate: string; endDate: string }
    >({
      query: (arg) => {
        const { ownerName, startDate, endDate } = arg
        return {
          url: `/monthlyaverageresults/${ownerName}?startDate=${startDate}&endDate=${endDate}`,
        }
      },
    }),
    getLatestResults: builder.query<LatestResultsResponse, void>({
      query: () => `/latestresults`,
    }),
    getMissingBlocksResults: builder.query<
      MissingBlocksResponse,
      { ownerName: string; startDate: string; endDate: string; top21: boolean }
    >({
      query: (arg) => {
        const { ownerName, startDate, endDate, top21 } = arg
        return {
          url: `/missing-blocks?ownerName=${ownerName}&startDate=${startDate}&endDate=${endDate}&top21=${top21}`,
        }
      },
    }),
    getProducers: builder.query<ProducersResponse, void>({
      query: () => `/producers`,
    }),
    getResults: builder.query<ResultsResponse, { ownerName: string }>({
      query: (arg) => {
        const { ownerName } = arg
        return {
          url: `truncatedPaginatedResults/${ownerName}?index=0&limit=100`,
        }
      },
    }),
    getTelegramdates: builder.query<TelegramDatesResponse, void>({
      query: () => `/dates`,
    }),
    reScan: builder.query<
      { message: string; type?: string },
      { ownerName: string }
    >({
      query: (arg) => {
        const { ownerName } = arg

        return {
          url: `/rescan/${ownerName}`,
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
  useLazyGetMissingBlocksResultsQuery,
  useGetAvgResultsQuery,
  useLazyReScanQuery,
  useGetTelegramdatesQuery,
} = api
