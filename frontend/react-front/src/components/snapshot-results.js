import React, { useState } from 'react'
import moment from 'moment'
/*import { api_base } from '../config'
import axios from 'axios'*/
import { Button } from '@material-ui/core';
import SnapshotScoring from './snapshot-scoring'
// import IntegratedScores from './integrated-snapshot-scores'


const App = ({ results, producers, products, bizdevs, community, snapresults, pointSystem }) => {
  // Set the latest reults to match current results, before snapshot is taken.
  // eslint-disable-next-line
  const [latestResults, setlatestResults] = useState(snapresults);
  // eslint-disable-next-line
  const [snapped, setSnapped] = useState(false)
  const [viewType, setViewType] = useState('individual')

  const lastfetched = !!snapresults && !!snapresults[0] && !!snapresults[0].snapshot_date ? moment(snapresults[0].snapshot_date).fromNow() : 'never';

  /* 
  const [popupOpen, setPopupOpen] = React.useState(false);

  const eventHandler = response => {
    setlatestResults(response.data)
  }

  // Get the promise
  function updateResults() {
    // Calls many times because snapshot results are individually loaded
    const promise = axios.get(api_base + '/api/snapshotlatestresults')
    promise.then(eventHandler)
  }


  //Get current timestamp
  var time = moment().format()

  const snapshotResults = (results) => {
    results.forEach(guild => { 
      const snapshotInfo = { owner_name: guild.owner_name, snapshot_date: time, date_check: guild.date_check }
      axios.post(api_base+'/api/snapshot', snapshotInfo)
      //Then re-update snapshot results to refresh the page
      .then(updateResults())
      .catch(error => {
        console.error('There was an error!', error);
      });
    });
  }
  
  const createSnapshot = () => {
    if (snapped === false) {
      setSnapped(true)
      snapshotResults(results)
    }
  }

  const handleClickOpen = () => {
    if (lastfetched.indexOf('week') !== -1) {
      createSnapshot()
    } else {
      setPopupOpen(true);
    }
  };

  const handleClose = () => {
    setPopupOpen(false);
  };

  const handleConfirm = () => {
    setPopupOpen(false);
    setSnapped(true)
    snapshotResults(results)
  }*/

  const changeView = () => {
    if (viewType === 'individual') {
      setViewType('integrated')
    } else {
      setViewType('individual')
    }
  }

  const getScoresView = () => {
    if (viewType === 'individual') {
      return <SnapshotScoring
        results={latestResults}
        producers={producers}
        products={products}
        bizdevs={bizdevs}
        community={community}
        pointSystem={pointSystem}
      />
    }
    /*if (viewType === 'integrated') {
      return <IntegratedScores
        results={latestResults}
        producers={producers}
        products={products}
        bizdevs={bizdevs}
        community={community}
      />
    }*/
    return null
  }

  return (
    <div>
      <h1>Scores</h1>
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
        disabled={snapped}
        onClick={changeView}
        style={{ marginBottom: '20px' }}
      >
        {viewType === 'individual' ? "Integrated" : "Individual"} View
      </Button>
      {/*<Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={snapped}
        onClick={handleClickOpen}
      >
      Create snapshot
      </Button>
      <Dialog
        open={popupOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Last snapshot made less than a week ago. Continue?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Last fetched: {lastfetched}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>*/}
      <div style={{ display: 'block', width: '100%' }}>
        {getScoresView()}
      </div>
    </div>
  )

}
export default App