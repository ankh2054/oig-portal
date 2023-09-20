export type GuildResult = {
  owner_name: string
  cors_check: boolean
  cors_check_error: string
  http_check: boolean
  http_check_error: string
  https_check: boolean
  https_check_error: string
  http2_check: boolean
  http2_check_error: string
  full_history: boolean
  full_history_error: string
  wwwjson: boolean
  wwwjson_error: string
  seed_node: boolean
  seed_node_error: string
  api_node: boolean
  api_node_error: string
  oracle_feed: boolean
  oracle_feed_error: string
  wax_json: boolean
  chains_json: boolean
  cpu_time: string
  date_check: Date
  score: string
  tls_check: string
  tls_check_error: string
  cpu_avg: string
  snapshot_date: null
  hyperion_v2: boolean
  hyperion_v2_error: string
  producer_api_error: string
  producer_api_check: string
  net_api_check: string
  net_api_error: string
  dbsize_api_check: string
  dbsize_api_error: string
  comments: null
  atomic_api: boolean
  atomic_api_error: string
  metasnapshot_date: Date
  hyperion_v2_testnet: boolean
  hyperion_v2_testnet_error: string
  hyperion_v2_full: boolean
  hyperion_v2_full_error: string
  hyperion_v2_testnet_full: boolean
  hyperion_v2_testnet_full_error: string
  chainscore: string
}

export type Producer = {
  owner_name: string
  candidate: string
  url: string
  jsonurl: string
  chainsurl: string
  active: boolean
  logo_svg: null | string
  top21: boolean
  country_code: null | string
  account_name: null | string
  metasnapshot_date: Date
  jsontestneturl: null | string
  notion_url?: string
}

export type TelegramDates = {
  type: string
  date: Date
}
export type TelegramDatesResponse = Array<TelegramDates>

export type AvgResultsResponse = {
  total_count: string
  chains_json_count: string
  wax_json_count: string
  api_node_count: string
  seed_node_count: string
  http_check_count: string
  https_check_count: string
  tls_ver_count: string
  http2_check_count: string
  history_v1_count: string
  hyperion_v2_count: string
  hyperion_v2_full_count: string
  hyperion_v2_testnet_count: string
  hyperion_v2_testnet_full_count: string
  atomic_api_count: string
  cors_check_count: string
  oracle_feed_count: string
  wwwjson_count: string
  cpu_time: string
  score_avg: string
  total_pct: string
  chains_json_pct: string
  wax_json_pct: string
  api_node_pct: string
  seed_node_pct: string
  http_check_pct: string
  https_check_pct: string
  tls_ver_pct: string
  http2_check_pct: string
  history_v1_pct: string
  hyperion_v2_pct: string
  hyperion_v2_full_pct: string
  hyperion_v2_testnet_pct: string
  hyperion_v2_testnet_full_pct: string
  atomic_api_pct: string
  cors_check_pct: string
  oracle_feed_pct: string
  wwwjson_pct: string
}

export type LatestResultsResponse = Array<GuildResult>

export type ProducersResponse = Array<Producer>
export type ResultsResponse = Array<GuildResult & { rownum: string }>

export type Block = {
  owner_name: string
  block_number: number
  date: Date
  round_missed: boolean
  blocks_missed: boolean
  missed_block_count: number
}
export type MissingBlocksResponse = {
  ownerName: string
  days: number
  percentageReliability?: number
  percentageMissed?: number
  totalMissedBlocks?: number
  totalExpectedBlocks?: number
  data: Array<Block>
}
