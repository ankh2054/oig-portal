import React from 'react'
import ProdBizdev from './product-bizdev-results'

const App = ({ results, producers, products, bizdevs, community }) => {
  return (
    <div style={{ textAlign: 'left', maxWidth: '1200px', display: 'inline-block'}}>
      <h2 style={{ border: '1px solid rgba(0, 0, 0, 0.54)', padding: '5px' }}>Products</h2>
      <ProdBizdev
          data={{ results: products, producers }}
        />
      <h2 style={{ border: '1px solid rgba(0, 0, 0, 0.54)', padding: '5px' }}>Bizdevs</h2>
      <ProdBizdev
          data={{ results: bizdevs, producers }}
        />
      <h2 style={{ border: '1px solid rgba(0, 0, 0, 0.54)', padding: '5px' }}>Community</h2>
      <ProdBizdev
          data={{ results: community, producers }}
        />
    </div>
  );
}

export default App