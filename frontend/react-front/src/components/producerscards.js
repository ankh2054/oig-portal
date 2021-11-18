import React from 'react'
import ProducerResults from './producer-results'


const App = ({ results, producers, products, bizdevs, community, producerLogos, producerDomainMap, minimumTechScore, metaSnapshotDate }) => {
  
  return (
    <div>
      <h1>Guild Results {metaSnapshotDate ? metaSnapshotDate.short : "No Time Machine date chosen"}</h1>
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