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
}))


const App = () => {
  const classes = useStyles();
  const [results, setResults] = useState([])
  const [producers, setProducers] = useState([])
  const [products, setProducts] = useState([])
  const [bizdevs, setBizdevs] = useState([])
  const [community, setCommunity] = useState([])
  const [latestresults, setLatestResults] = useState([])
  const [snapshotlatestresults, setSnapshotLatestResults] = useState([])
  const [snapshotSettings, setSnapshotSettings] = useState([])
  const [pointSystem, setPointSystem] = useState([])

  useEffect(() => {
    // Load data and set hooks. A future implementation could use axios.all
    axios.get(api_base + '/api/results').then((response) => {
      setResults(response.data)
    });
    axios.get(api_base + '/api/producers').then((response) => {
      setProducers(response.data)
    });
    axios.get(api_base + '/api/products').then((response) => {
      setProducts(response.data)
    });
    axios.get(api_base + '/api/bizdevs').then((response) => {
      setBizdevs(response.data)
    });
    axios.get(api_base + '/api/community').then((response) => {
      setCommunity(response.data)
    });
    axios.get(api_base + '/api/latestresults').then((response) => {
      setLatestResults(response.data)
    });
    axios.get(api_base + '/api/snapshotlatestresults').then((response) => {
      setSnapshotLatestResults(response.data)
    });
    axios.get(api_base + '/api/snapshotsettings').then((response) => {
      setSnapshotSettings(response.data)
    });
    axios.get(api_base + '/api/pointsystem').then((response) => {
      setPointSystem(response.data)
    });
  }, [])

  const BPwithownername = () => {
    let params = useParams();

    return (
      <>
        <ProducerDetails
          results={results.filter((result) => result.owner_name === params.ownername)}
          products={products.filter((result) => result.owner_name === params.ownername)}
          bizdevs={bizdevs.filter((result) => result.owner_name === params.ownername)}
        />
      </>
    );
  }
  
  const AdminPanel = ({snapshotSettings, pointSystem}) => {
    //let params = useParams();
    return <div>
      <h1>hello world</h1>
      <p>{JSON.stringify(snapshotSettings)}</p>
      <p>{JSON.stringify(pointSystem)}</p>
    </div>
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
                    <Route path="/latestresults" component={() => <MonthlyResults
                      results={latestresults}

                    />} exact />
                    <Route exact path="/snapshot" component={() => <SnapshotResults
                      results={latestresults}
                      producers={producers}
                      products={products}
                      bizdevs={bizdevs}
                      community={community}
                      snapresults={snapshotlatestresults}
                    />} />
                    <Route exact path="/" component={() =>
                      <ProducerCards results={latestresults}
                        producers={producers}
                        products={products}
                        bizdevs={bizdevs}
                        community={community}
                      />} />
                    <Route exact path='/guilds/:ownername' component={BPwithownername} />
                    <Route exact path='/form' component={() => <Testform producers={producers} />} />
                    <Route exact path='/admin' component={() => <AdminPanel snapshotSettings={snapshotSettings} pointSystem={pointSystem} />} />
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
