import React from 'react'
import ProducerResults from './producer-results'


const App = ({ results, producers, products, bizdevs, community, producerLogos, producerDomainMap, minimumTechScore, metaSnapshotDate, formatDate }) => {
  
  return (
    <div>
      <h1>Guild Results {(metaSnapshotDate && metaSnapshotDate !== 'None') ? <span style={{fontSize: '16px', fontWeight: 'bolder'}}>{formatDate(metaSnapshotDate)}</span> : <span style={{fontSize: '16px', fontWeight: 'bolder'}}>(No Time Machine date chosen)</span>}</h1>
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