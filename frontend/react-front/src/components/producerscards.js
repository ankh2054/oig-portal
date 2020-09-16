import React from 'react'
import ProducerResults from './producer-results'


const App = ({ results, producers, products, bizdevs, community }) => {
  
  return (
    <div>
      <h1>Guild Results</h1>
      <ProducerResults
            results={ results }
            producers={ producers }
            products={ products }
            bizdevs={ bizdevs }
            community={ community }
       />
    </div>
  )

}

export default App