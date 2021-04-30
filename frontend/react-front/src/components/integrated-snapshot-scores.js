import React from 'react'
import { reArrangeTableHeaders } from './snapshot-scoring'
import TableDataGrid from './table-datagrid'

// Return Guild Logo
function getGuildLogoURL(guild, producers) {
  let ownername = producers.find((producer) => producer.owner_name === guild)
  //Conditional rendering if ownername is true, return logosvg.logo_svg
  // Because one of your producers does not have a logo set
  let logosvg_url = ownername ? ownername.logo_svg : ""
  return logosvg_url
}

const App = ({ results, producers, products, bizdevs, community }) => {
  function format(array) {
    // Any manipulations of initially loaded data can be done here
    if (array.length >= 1) {
      // Place comments second to front for product & bizdev, front for community & tech
      return array.map((item) => {
        const itemWithGuildLogo = {
          guild: getGuildLogoURL(item.owner_name, producers),
          ...item
        }
        return reArrangeTableHeaders(itemWithGuildLogo)
      })
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