import React from 'react'
import { reArrangeTableHeaders } from './snapshot-scoring'
import TableDataGrid from './table-datagrid'

const App = ({ results, producers, products, bizdevs, community }) => {
  function format(array) {
    // Any manipulations of initially loaded data can be done here
    if (array.length >= 1) {
      // Place comments second to front for product & bizdev, front for community & tech
      return array.map((item) => reArrangeTableHeaders(item))
    }
    return array
  }

  return (
    <>
      <TableDataGrid
        tabledata={format(products)}
        tabletitle="Products"
      />
      <TableDataGrid
        tabledata={format(bizdevs)}
        tabletitle="Bizdevs"
      />
      <TableDataGrid
        tabledata={format(community)}
        tabletitle="Community"
      />
      <TableDataGrid
        tabledata={format(results)}
        tabletitle="Snapshot Tech Results"
      />
    </>
  );
}

export default App