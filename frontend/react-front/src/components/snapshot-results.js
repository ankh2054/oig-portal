import React, { useState, useEffect } from 'react'
import moment from 'moment'
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