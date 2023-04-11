import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import ky from 'ky'

import type { LastestResultsResponse, ProducersResponse } from './types'

// Define a service using a base URL and expected endpoints
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://oig.sentnl.io/api',
    fetchFn: (...args) => ky(...args),
  }),
  endpoints: (builder) => ({
    getLatestResults: builder.query<LastestResultsResponse, void>({
      query: () => `/latestresults`,
    }),
    getProducers: builder.query<ProducersResponse, void>({
      query: () => `/producers`,
    }),
  }),
  reducerPath: 'sentnlApi',
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetLatestResultsQuery, useGetProducersQuery } = api
