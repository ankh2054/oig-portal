import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import axios from 'axios'
import ResultTables from './tablelist-results'


const App = () => {
  const [results, setResults] = useState([])

  useEffect(() => {

    // Event handler being called when promise is returned
    const eventHandler = response => {
      console.log('promise fulfilled')
      setResults(response.data)
    }
    // Get the promise
    const promise = axios.get('http://localhost:3000/latestresults')
    promise.then(eventHandler)
  }, [])
  console.log('render', results.length, 'notes')
  console.log(results)



  return (
    <div>
      <h1>Results</h1>
      <ResultTables
            results={ results }
            description="Wax Mainnet"
       />
    </div>
  )

}


export default App