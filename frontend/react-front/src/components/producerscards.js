import React from 'react'
import ProducerResults from './producer-results'


const App = ({ results, producers, products, bizdevs, community, producerLogos, producerDomainMap, minimumTechScore }) => {
  
  return (
    <div>
      <h1>Guild Results</h1>
      <ProducerResults
            results={ results }
            producers={ producers }
            products={ products }
            bizdevs={ bizdevs }
            community={ community }
            producerLogos={producerLogos}
            producerDomainMap={producerDomainMap}
            minimumTechScore={minimumTechScore}
       />
    </div>
  )

}

export default App