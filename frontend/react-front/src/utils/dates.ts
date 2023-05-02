import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  monthsShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
})

export const fullDate = (date: Date) => {
  return dayjs(date).format('DD/MM/YY[@]H:mm') // display
}
export const shortDate = (date: Date) => {
  return dayjs(date).format('DD MMMM[@]H:mm') // display
}
