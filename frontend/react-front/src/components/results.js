import React from 'react'
import TechresultTables from './tech-tablelist-results'

const App = ({ results, activeGuilds, top21Guilds }) => {
  return (
    <div>
      <h1>Latest Results</h1>
      <TechresultTables
            passedResults={ results }
            activeGuilds={ activeGuilds }
            top21Guilds={ top21Guilds }
            description="WAX Mainnet"
       />
    </div>
  )

}
export default App