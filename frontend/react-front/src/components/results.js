import React from 'react'
import TechresultTables from './tech-tablelist-results'

const App = ({ results, activeGuilds }) => {
  return (
    <div>
      <h1>Latest Results</h1>
      <TechresultTables
            passedResults={ results }
            activeGuilds={ activeGuilds }
            description="WAX Mainnet"
       />
    </div>
  )

}
export default App