import React, { useState } from 'react'
import moment from 'moment'
import datec from '../functions/date' // Using datec to be consistent for snapshot date check
import { api_base } from '../config'
import axios from 'axios'
import Button from '@material-ui/core/Button';
import SnapshotScoring from './snapshot_scoring'


const App = ({ results, producers, products, bizdevs, community, snapresults }) => {
  // Set the latest reults to match current results, before snapshot is taken.
  const [latestResults, setlatestResults] = useState(snapresults);

   const eventHandler = response => {
        setlatestResults(response.data)
   }
   // Get the promise
   function updateResults() {
        // Idempotency needed here. Will endlessly call
        const promise = axios.get(api_base+'/api/snapshotlatestresults')
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
  return (
    <div>
      <h1>OIG Monthly Admin</h1>
      {/* We can select the date from the first entry of snapresults (usually aikon) 
          because all snapshots are done at the same time. If we ever 
          change fastify /api/snapshotlatestresults to include a universal
          last checked date, then it would be good to change this code. */}
      {!!snapresults && !!snapresults[0] && !!snapresults[0].date_check ? <h3>Snapshot data last fetched at: {datec(snapresults[0].date_check)}</h3> : null}
        <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => snapshotResults(results)}
        >
        Create snapshot
        </Button>
        <SnapshotScoring 
            results={ latestResults }
            producers={ producers }
            products={ products }
            bizdevs={ bizdevs }
            community={ community }
        />
    </div>
  )

}
export default App