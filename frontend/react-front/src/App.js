import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import MonthlyResults from './components/results'
import SnapshotResults from './components/snapshot-results'
import ProducerCards from './components/producerscards'
import ProducerDetails from './components/producer-detail'
import Testform from './components/monthly-updates'
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { api_base } from './config'

//import 'fontsource-roboto';
import ButtonAppBar from './components/appbar'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


const App = () => {
  const classes = useStyles();
  const [results, setResults] = useState([])
  const [producers, setProducers] = useState([])
  const [products, setProducts] = useState([])
  const [bizdevs, setBizdevs] = useState([])
  const [community, setCommunity] = useState([])
  const [latestresults, setLatestResults] = useState([])
  const [snapshotlatestresults, setSnapshotLatestResults] = useState([])

  useEffect(() => {

     const eventHandler = response => {
      setResults(response.data)
    }
    const producerHandler = response => {
        setProducers(response.data)
      }
    const productsHandler = response => {
        setProducts(response.data)
      }
    const bizdevsHandler = response => {
        setBizdevs(response.data)
      }
    const communityHandler = response => {
        setCommunity(response.data)
      }
    const latestResultsHandler = response => {
        setLatestResults(response.data)
      }
    const snapshotResultsHandler = response => {
      setSnapshotLatestResults(response.data)
      }
    // Get the promise
    const promise = axios.get(api_base+'/api/results')
    promise.then(eventHandler)
    const promise2 = axios.get(api_base+'/api/producers')
    promise2.then(producerHandler)
    const promise3 = axios.get(api_base+'/api/products')
    promise3.then(productsHandler)
    const promise4 = axios.get(api_base+'/api/bizdevs')
    promise4.then(bizdevsHandler)
    const promise5 = axios.get(api_base+'/api/community')
    promise5.then(communityHandler)
    const promise6 = axios.get(api_base+'/api/latestresults')
    promise6.then(latestResultsHandler)
    const promise7 = axios.get(api_base+'/api/snapshotlatestresults')
    promise7.then(snapshotResultsHandler)
  }, [])
  const BPwithownername = () =>{
    let params = useParams();

    return(
      <>
      <ProducerDetails
      producer={producers.filter((result) => result.owner_name === params.ownername)[0]}
      results={results.filter((result) => result.owner_name === params.ownername)}
      products={products.filter((result) => result.owner_name === params.ownername)}
      bizdevs={bizdevs.filter((result) => result.owner_name === params.ownername)}
      />
      </>
    );
  }
  return (
    <main>
      <Switch>
      <>
      <CssBaseline />
      <Container component="main" maxWidth="xl">
      <ButtonAppBar />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Router>
                <Route path="/latestresults" component={() =><MonthlyResults 
                results={ latestresults } 
                
                /> } exact />
                <Route exact path="/snapshot" component={() =><SnapshotResults 
                results={ latestresults } 
                producers={ producers }
                products={ products }
                bizdevs={ bizdevs } 
                community={ community }
                snapresults={ snapshotlatestresults }
                /> } />
                <Route exact path="/" component={() => 
                <ProducerCards  results={ latestresults }
                producers={ producers }
                products={ products }
                bizdevs={ bizdevs } 
                community={ community }
                />} />
                <Route exact path='/guilds/:ownername' component={BPwithownername} />
                <Route exact path='/form' component={() => <Testform producers={ producers } /> } />
            </Router>
          </Paper>
        </Grid>
      </Grid>
      </Container>
      </>
      </Switch>
    </main>

  );
}



export default App;
