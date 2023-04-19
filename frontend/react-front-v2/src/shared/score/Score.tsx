import cx from 'classnames'
import './Score.css'

interface Props {
  title: string
  score: number
}
const Score = ({ title, score }: Props) => {
  const isLow = score < 50
  return (
    <div className="flex flex-col items-center">
      <div
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-full bg-opacity-10 p-5 align-middle',
          { 'bg-error': isLow },
          { 'bg-success': !isLow }
        )}
      >
        <span className="text-sm font-medium text-gray">{score}</span>
      </div>
      <div className="text-sm text-gray">{title}</div>
    </div>
  )
}

export default Score
