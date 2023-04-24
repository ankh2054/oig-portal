import moment from 'moment'

const datec = (date: Date) => {
  return moment(date).format(`DD/MM/YY[@]H:mm`)
}

export default datec
