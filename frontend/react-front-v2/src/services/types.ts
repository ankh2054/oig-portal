export type LastestResultsResponse = Array<GuildResult>

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
}

export type ProducersResponse = Array<Producer>
