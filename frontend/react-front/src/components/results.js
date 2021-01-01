import React from 'react'
import TechresultTables from './tech-tablelist-results'



const App = ({ results }) => {
  return (
    <div>
      <h1>Latest Results</h1>
      <TechresultTables
            results={ results }
            description="WAX Mainnet"
       />
    </div>
  )

}
export default App