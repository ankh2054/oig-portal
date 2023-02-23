import React, { useState } from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { SnapshotScoring } from './snapshot-scoring'
import IntegratedScores from './integrated-snapshot-scores'

const useStyles = makeStyles((theme) => ({
  changeViewButton: {
    marginBottom: '20px'
  },
  viewHolder: {
    display: 'block', width: '100%'
  }
}))

const SnapshotResults = ({ /*results, */ producers, products, bizdevs, community, snapresults, pointSystem, isAdmin, producerLogos, producerDomainMap, activeGuilds, metaSnapshotDate, formatDate, defaultMetaSnapshotDate }) => {
  const classes = useStyles();

  const [viewType, setViewType] = useState('integrated')
  const lastfetched = !!snapresults && !!snapresults[0] && !!snapresults[0].snapshot_date ? moment(snapresults[0].snapshot_date).fromNow() : 'never';

  const changeView = () => {
    if (viewType === 'individual') {
      setViewType('integrated')
    } else {
      setViewType('individual')
    }
  }

  const filterMetaSnapshots = (rows) => {
    if (!!metaSnapshotDate) {
      return rows.filter(row => row.metasnapshot_date && row.metasnapshot_date.substring(0, 10) === metaSnapshotDate)
    }
    return rows.filter(row => row.metasnapshot_date === defaultMetaSnapshotDate || row.metasnapshot_date === null)
  }

  const filterMetaSnapshots2 = (rows) => {
    if (!!metaSnapshotDate) {
      return rows.filter(row => row.metasnapshot_date && row.metasnapshot_date.substring(0, 10) === metaSnapshotDate)
    }
    return rows
  }

  const loadView = () => {
    if (viewType === 'individual') {
      return <SnapshotScoring
        results={filterMetaSnapshots(snapresults)}
        producers={producers}
        products={filterMetaSnapshots(products)}
        bizdevs={filterMetaSnapshots(bizdevs)}
        community={filterMetaSnapshots(community)}
        pointSystem={pointSystem}
        isAdmin={isAdmin}
        producerLogos={producerLogos}
        producerDomainMap={producerDomainMap}
      />
    }
    if (viewType === 'integrated') {
      return <IntegratedScores
        results={(snapresults)}
        producers={producers}
        products={filterMetaSnapshots(products)}
        bizdevs={filterMetaSnapshots(bizdevs)}
        community={filterMetaSnapshots(community)}
        pointSystem={pointSystem}
        isAdmin={isAdmin}
        producerLogos={producerLogos}
        producerDomainMap={producerDomainMap}
        activeGuilds={activeGuilds}
      />
    }
    return null
  }

  return (
    <div>
      <h1>Scores {(metaSnapshotDate && metaSnapshotDate !== 'None') ? <span style={{fontSize: '16px', fontWeight: 'bolder'}}>{formatDate(metaSnapshotDate) }</span>: <span style={{fontSize: '16px', fontWeight: 'bolder'}}>(No Time Machine date chosen)</span>}</h1>
      {/* We can select the date from the first entry of snapresults (usually aikon) 
          because all snapshots are done at the same time. If we ever 
          change fastify /api/snapshotlatestresults to include a universal
          last checked date, then it would be good to change this code. */}
      {/* This will flash 'never' while loading. We could also hide it from displaying */}
      <h3>Snapshot data last fetched: {lastfetched}</h3>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={changeView}
        className={classes.changeViewButton}
      >
        {viewType === 'individual' ? "Integrated" : "Individual"} View
      </Button>
      <div className={classes.viewHolder}>
        {loadView()}
      </div>
    </div>
  )

}
export default SnapshotResults