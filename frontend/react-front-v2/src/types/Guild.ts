import type { GuildResult } from '../services/types'

export type Guild = GuildResult & {
  top21: Boolean
  country_code: null | string
  logo_svg: null | string
}
