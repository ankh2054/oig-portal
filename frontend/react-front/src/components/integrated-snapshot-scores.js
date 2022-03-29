import React from 'react'
import { reArrangeTableHeaders } from './snapshot-scoring'
import TableDataGrid from './table-datagrid'
import getCachedImage from './getCachedImage'

// Return Guild Logo
function getGuildLogoURL(guild, producers, producerLogos, producerDomainMap) {
  let ownername = producers.find((producer) => producer.owner_name === guild)
  //Conditional rendering if ownername is true, return logosvg.logo_svg
  // Because one of your producers does not have a logo set
  let logosvg_url = ownername ? ownername.logo_svg : ""
  return getCachedImage(logosvg_url, producerLogos, producerDomainMap)
}

const IntegratedScores = ({ results, producers, products, bizdevs, community, isAdmin, pointSystem, producerLogos, producerDomainMap, activeGuilds }) => {
  function format(array) {
    // Any manipulations of initially loaded data can be done here
    if (array.length >= 1) {
      // Place comments second to front for product & bizdev, front for community & tech
      return array.map(item => {
        const itemWithGuildLogo = {
          guild: getGuildLogoURL(item.owner_name, producers, producerLogos, producerDomainMap),
          ...item
        }
        return reArrangeTableHeaders(itemWithGuildLogo)
      })//.filter(result => activeGuilds.indexOf(result.owner_name) !== -1)
    }
    return array
  }

  return (
    <>
      <TableDataGrid
        tableData={format(products)}
        tableTitle="Products"
        isAdmin={isAdmin}
        pointSystem={pointSystem}
      />
      <TableDataGrid
        tableData={format(bizdevs)}
        tableTitle="Bizdevs"
        isAdmin={isAdmin}
        pointSystem={pointSystem}
      />
      <TableDataGrid
        tableData={format(community)}
        tableTitle="Community"
        isAdmin={isAdmin}
        pointSystem={pointSystem}
      />
      <TableDataGrid
        tableData={format(results)}
        tableTitle="Snapshot Tech Results"
        isAdmin={isAdmin}
        pointSystem={pointSystem}
      />
    </>
  );
}

export default IntegratedScores