import GuildCard from '../../shared/guild-card/GuildCard'
import ResultsToggle from '../../shared/result-toggle/ResultsToggle'

const LatestResults = () => {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="text-2xl">Latest results</h3>
        <ResultsToggle />
      </div>
      <div className="flex w-full flex-col gap-y-4">
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
        <GuildCard />
      </div>
    </div>
  )
}

export default LatestResults
