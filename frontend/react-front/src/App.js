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
import AdminPanel from './components/admin'
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { api_base } from './config'
// import {addScoreToItem} from './functions/scoring'

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
  // const [rawResults, setRawResults] = useState([])
  const [results, setResults] = useState([])
  const [producers, setProducers] = useState([])
  // const [rawProducts, setRawProducts] = useState([])
  const [products, setProducts] = useState([])
  // const [rawBizdevs, setRawBizdevs] = useState([])
  const [bizdevs, setBizdevs] = useState([])
  // const [rawCommunity, setRawCommunity] = useState([])
  const [community, setCommunity] = useState([])
  // const [rawLatestResults, setRawLatestResults] = useState([])
  const [latestresults, setLatestResults] = useState([])
  // const [rawSnapshotLatestResults, setRawSnapshotLatestResults] = useState([])
  const [snapshotlatestresults, setSnapshotLatestResults] = useState([])
  const [snapshotSettings, setSnapshotSettings] = useState([])
  const [rawPointSystem, setRawPointSystem] = useState([])
  const [pointSystem, setPointSystem] = useState([])

  useEffect(() => {
    // Load data and set hooks. A future implementation could use axios.all
    axios.get(api_base + '/api/results').then((response) => {
      // setRawResults(response.data)
      setResults(response.data)
    });
    axios.get(api_base + '/api/producers').then((response) => {
      setProducers(response.data)
    });
    axios.get(api_base + '/api/products').then((response) => {
      // setRawProducts(response.data)
      setProducts(response.data)
    });
    axios.get(api_base + '/api/bizdevs').then((response) => {
      // setRawBizdevs(response.data)
      setBizdevs(response.data)
    });
    axios.get(api_base + '/api/community').then((response) => {
      // setRawCommunity(response.data)
      setCommunity(response.data)
    });
    axios.get(api_base + '/api/latestresults').then((response) => {
      // setRawLatestResults(response.data)
      setLatestResults(response.data)
    });
    axios.get(api_base + '/api/snapshotlatestresults').then((response) => {
      // setRawSnapshotLatestResults(response.data)
      setSnapshotLatestResults(response.data)
    });
    axios.get(api_base + '/api/snapshotsettings').then((response) => {
      setSnapshotSettings(response.data)
    });
    axios.get(api_base + '/api/pointsystem').then((response) => {
      const pointSystemBase = response.data;
      setRawPointSystem(pointSystemBase)
      // More useful as an object
      let formattedPointSystem = {};
      pointSystemBase.forEach(item => {
        formattedPointSystem[item.points_type] = [item.points, item.multiplier]
      });
      setPointSystem(formattedPointSystem)
    })
  }, []);

  /* Calculate scores if formatted point system exists, and raw data (to be scored) exists
  // This gets called twice (as do many functions). it appears to be due to React.StrictMode
  // Fixing this would result in a lot of speed increases, I would guess.
  if (Object.keys(pointSystem).length >= 1) {
    if (results.length === 0 && rawResults.length >= 1) {
      // This is bound to use up a lot of memory when adding scores - it's an array of 2.3k items.
      //const formattedResults = rawResults.map((item) => addScoreToItem(item, pointSystem));
      setResults(rawResults);
    }

    if (products.length === 0 && rawProducts.length >= 1) {
      const formattedProducts = rawProducts.map((item) => addScoreToItem(item, pointSystem, 'product'));
      setProducts(formattedProducts);
    }

    if (bizdevs.length === 0 && rawBizdevs.length >= 1) {
      const formattedBizdevs = rawBizdevs.map((item) => addScoreToItem(item, pointSystem, 'bizdev'));
      setBizdevs(formattedBizdevs);
    }

    if (community.length === 0 && rawCommunity.length >= 1) {
      const formattedCommunity = rawCommunity.map((item) => addScoreToItem(item, pointSystem, 'community'));
      setCommunity(formattedCommunity);
    }

    if (latestresults.length === 0 && rawLatestResults.length >= 1) {
      const formattedLatestResults = rawLatestResults.map((item) => addScoreToItem(item, pointSystem));
      setLatestResults(formattedLatestResults);
    }

    if (snapshotlatestresults.length === 0 && rawSnapshotLatestResults.length >= 1) {
      const formattedLatestSnapshotResults = rawSnapshotLatestResults.map((item) => addScoreToItem(item, pointSystem));
      setSnapshotLatestResults(formattedLatestSnapshotResults);
    }
  }*/

  const BPwithownername = () => {
    let params = useParams();

    return (
      <>
        <ProducerDetails
          producer={producers.filter((result) => result.owner_name === params.ownername)[0]}
          results={results.filter((result) => result.owner_name === params.ownername)}
          products={products.filter((result) => result.owner_name === params.ownername)}
          bizdevs={bizdevs.filter((result) => result.owner_name === params.ownername)}
          pointSystem={pointSystem}
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
                    <Route path="/latestresults" component={() => <MonthlyResults
                      results={latestresults}

                    />} exact />
                    <Route exact path="/snapshot" component={() => <SnapshotResults
                      /*results={latestresults}*/
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
                    <Route exact path='/admin' component={() => <AdminPanel snapshotSettings={snapshotSettings} pointSystem={rawPointSystem} />} />
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
