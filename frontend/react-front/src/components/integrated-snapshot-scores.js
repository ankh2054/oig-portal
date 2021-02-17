import React from 'react'
import ProdBizdev from './product-bizdev-results'

const App = ({ results, producers, products, bizdevs, community }) => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Products</h2>
      <ProdBizdev
          data={{ results: products, producers }}
        />
      <h2>Bizdevs</h2>
      <ProdBizdev
          data={{ results: bizdevs, producers }}
        />
      <h2>Community</h2>
      <ProdBizdev
          data={{ results: community, producers }}
        />
    </div>
  );
}

export default App