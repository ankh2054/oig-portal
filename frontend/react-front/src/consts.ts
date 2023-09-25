import { dayjs } from './utils/dates'

export const CURRENT_DATE = dayjs()
export const DATE_LAST_30_DAYS = CURRENT_DATE.subtract(30, 'day')
