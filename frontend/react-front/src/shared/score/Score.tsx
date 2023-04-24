import './Score.css'

interface Props {
  title: string
  score: number
}
const Score = ({ title, score }: Props) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-md font-medium text-black">{score}</div>
      <div className="text-sm text-gray">{title}</div>
    </div>
  )
}

export default Score
