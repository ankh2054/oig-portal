import './Score.css'

interface Props {
  title: string
  value: string
}
const Score = ({ title, value }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-md font-medium text-black">{value}</div>
      <div className="text-sm text-gray">{title}</div>
    </div>
  )
}

export default Score
