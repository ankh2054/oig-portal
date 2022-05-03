import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useParams,
} from "react-router-dom";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import MonthlyResults from "./pages/results";
import SnapshotResults from "./pages/snapshot-results";
import ProducerCards from "./pages/producerscards";
import ProducerDetails from "./pages/producer-detail";
import Testform from "./pages/monthly-updates";
import AdminPanel from "./pages/admin";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { api_base, admin_override } from "./config";
import Home from './pages/home/Home';
import Sidebar from "./components/sidebar/Sidebar";
// import {addScoreToItem} from './functions/scoring'

//import 'fontsource-roboto';
import ButtonAppBar from "./pages/appbar";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function importAll(r) {
  let producerDomainMap = {};
  r.keys().forEach((r, index) => {
    const base = r.split("/");
    producerDomainMap[base[2]] = [base[1], index];
  });

  return {
    producerLogos: r.keys().map(r),
    producerDomainMap,
  };
}

const { producerLogos, producerDomainMap } = importAll(
  require.context("./assets/logo_cache", true, /\.(png|jpe?g|svg)$/)
);

const App = (props) => {
  const admins = [
    "oigservicesx",
    "rakeden.oig",
    "ig.kaefer",
    "wjosep.oig",
    "sentnlagents",
  ];

  const adminOverride = admin_override; // Whether to require wallet authentication to access admin features.

  const classes = useStyles();
  const [rawProducers, setRawProducers] = useState([]);
  const [producers, setProducers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bizdevs, setBizdevs] = useState([]);
  const [community, setCommunity] = useState([]);
  const [latestresults, setLatestResults] = useState([]);
  const [snapshotlatestresults, setSnapshotLatestResults] = useState([]);
  const [snapshotSettings, setSnapshotSettings] = useState([]);
  const [rawPointSystem, setRawPointSystem] = useState([]);
  const [pointSystem, setPointSystem] = useState([]);
  const [minimumTechScore, setMinimumTechScore] = useState(999);
  const [metaSnapshotDate, setMetaSnapshotDate] = useState(null);
  const [availableMetaSnapshots, setAvailableMetaSnapshots] = useState([]);
  const [defaultMetaSnapshotDate, setDefaultMetaSnapshotDate] = useState(
    "1980-01-01T00:00:00.000Z"
  );

  const monthMap = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const updateMetaSnapshotDate = (date) => {
    // const year = date.substring(0, 4);
    // const month = date.substring(5, 7);
    // const day = date.substring(8, 10);
    // const short = `${monthMap[month - 1]}/${year.substring(2, 4)}`;
    // console.log("Meta-snapshot options: " + availableMetaSnapshots.join(", "));
    setMetaSnapshotDate(date);
  };

  const openTimeMachine = () => {
    if (availableMetaSnapshots.length >= 1) {
      updateMetaSnapshotDate(availableMetaSnapshots[0]);
    } else {
      alert("Loading meta-snapshots... please wait.");
    }
  };

  const formatDate = (dateString) => {
    if(!dateString){
        return
    } 
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
}

  useEffect(() => {
    // Load data and set hooks. A future implementation could use axios.all
    /* axios.get(api_base + '/api/results').then((response) => {
      // setRawResults(response.data)
      setResults(response.data)
    });*/
    axios.get(api_base + "/api/producers").then((response) => {
      setRawProducers(response.data);
      setProducers(
        response.data.filter((producer) => producer.active === true)
      );
    });
    axios.get(api_base + "/api/products").then((response) => {
      // setRawProducts(response.data)
      setProducts(response.data);
    });
    axios.get(api_base + "/api/bizdevs").then((response) => {
      console.log('bizdevs data is', response.data)
      setBizdevs(response.data);
    });
    axios.get(api_base + "/api/community").then((response) => {
      // setRawCommunity(response.data)
      setCommunity(response.data);
    });    
    
    axios.get(api_base + "/api/snapshotsettings/").then((response) => {
      setSnapshotSettings(response.data);
    });
    axios.get(api_base + "/api/pointsystem").then((response) => {
      const pointSystemBase = response.data;
      setRawPointSystem(pointSystemBase);
      // More useful as an object
      let formattedPointSystem = {};
      pointSystemBase.forEach((item) => {
        formattedPointSystem[item.points_type] = [item.points, item.multiplier];
      });
      setPointSystem(formattedPointSystem);
    });
    axios.get(api_base + "/api/getAdminSettings").then((response) => {
      const data = response.data;
      const availableMetaSnapshots = data
        .filter((row) => !!row.metasnapshot_date)
        .map((row) => row.metasnapshot_date.substring(0, 10));        
      // availableMetaSnapshots[0] = 'None';
      setAvailableMetaSnapshots(availableMetaSnapshots);
      // console.log("Set available meta-snapshots");
      // const minScore =
      //   data && data[0] && data[0].minimum_tech_score
      //     ? data[0].minimum_tech_score
      //     : 999;
      const minScoreArray = data.filter(row => row.metasnapshot_date === defaultMetaSnapshotDate)
      const minScoreRec = minScoreArray && minScoreArray[0] && minScoreArray[0].minimum_tech_score
      ? minScoreArray[0].minimum_tech_score
      : 999;
      setMinimumTechScore(minScoreRec);
    });
  }, []);

  useEffect(() => {
    axios.get(api_base + `/api/latestresults/${metaSnapshotDate ? metaSnapshotDate : defaultMetaSnapshotDate}`).then((response) => {
      console.log('api result is', response.data)
      setLatestResults(response.data);
    });
    axios.get(api_base + `/api/snapshotlatestresults/${metaSnapshotDate ? metaSnapshotDate : ''}`).then((response) => {
      setSnapshotLatestResults(response.data);
    });
  }, [metaSnapshotDate]) 

  const BPwithownername = () => {
    let params = useParams();

    return (
      <>
        <ProducerDetails
          producer={
            rawProducers.filter(
              (result) => result.owner_name === params.ownername
            )[0]
          }
          latestresults={latestresults}
          producerLogos={producerLogos}
          producerDomainMap={producerDomainMap}
          activeUser={props.ual.activeUser}
          metaSnapshotDate={metaSnapshotDate}
          openTimeMachine={openTimeMachine}
        />
      </>
    );
  };

  return (
    <React.Fragment>
      <Switch>
      <Router>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Sidebar
          activeUser={props.ual.activeUser}
          loginModal={props.ual.showModal}
          logOut={props.ual.logout}
         style={{flex: '1'}} 
        />
        <div style={{flex: '4', maxWidth: '1090px'}}>
          <CssBaseline />
          <Container component="main">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <ButtonAppBar
                      activeUser={props.ual.activeUser}
                      loginModal={props.ual.showModal}
                      logOut={props.ual.logout}
                      metaSnapshotDate={metaSnapshotDate}
                      openTimeMachine={openTimeMachine}
                      setMetaSnapshotDate={setMetaSnapshotDate}
                      availableMetaSnapshots={availableMetaSnapshots}
                      isAdmin={
                        adminOverride ||
                        (props.ual.activeUser &&
                          admins.indexOf(props.ual.activeUser.accountName) !==
                            -1)
                      }
                    />
                    <Route
                      path="/latestresults"
                      component={() => (
                        <MonthlyResults
                          results={latestresults}
                          activeGuilds={producers.map(
                            (producer) => producer.owner_name
                          )}
                          top21Guilds={rawProducers
                            .filter((producer) => producer.top21 === true)
                            .map((producer) => producer.owner_name)}
                        />
                      )}
                      exact
                    />
                    <Route
                      exact
                      path="/snapshot"
                      component={() => (
                        <SnapshotResults
                          /*results={latestresults}*/
                          producers={producers}
                          products={products}
                          bizdevs={bizdevs}
                          pointSystem={pointSystem}
                          community={community}
                          snapresults={snapshotlatestresults}
                          isAdmin={
                            adminOverride ||
                            (props.ual.activeUser &&
                              admins.indexOf(
                                props.ual.activeUser.accountName
                              ) !== -1)
                          }
                          producerLogos={producerLogos}
                          producerDomainMap={producerDomainMap}
                          activeGuilds={rawProducers
                            .filter((producer) => producer.active === true)
                            .map((producer) => producer.owner_name)}
                          metaSnapshotDate={metaSnapshotDate}
                          formatDate={formatDate}
                          defaultMetaSnapshotDate={defaultMetaSnapshotDate}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/home"
                      component={() => (
                        <ProducerCards
                          results={latestresults}
                          producers={rawProducers}
                          products={products}
                          bizdevs={bizdevs}
                          community={community}
                          producerLogos={producerLogos}
                          producerDomainMap={producerDomainMap}
                          minimumTechScore={minimumTechScore}
                          metaSnapshotDate={metaSnapshotDate}
                          formatDate={formatDate}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/guilds/:ownername"
                      component={BPwithownername}
                    />
                    <Route 
                      exact
                      path='/'
                      // component={<Home />}
                      component={() => (
                        <Home
                          activeUser={props.ual.activeUser}
                          producers={rawProducers}
                          products={products}
                          latestresults={latestresults}
                          snapresults={snapshotlatestresults}
                          bizdevs={bizdevs}
                          community={community}
                          isAdmin={
                            adminOverride ||
                            (props.ual.activeUser &&
                              admins.indexOf(
                                props.ual.activeUser.accountName
                              ) !== -1)
                          }
                          top21Guilds={producers.filter((producer) => producer.active === true)
                            .filter(producer => producer.top21 === true)
                            .map((producer) => (
                              {
                                owner_name: producer.owner_name,
                                logo_svg: producer.logo_svg
                              }
                            ))}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/form"
                      component={() => (
                        <Testform
                          producers={producers}
                          isAdmin={
                            adminOverride ||
                            (props.ual.activeUser &&
                              admins.indexOf(
                                props.ual.activeUser.accountName
                              ) !== -1)
                          }
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/admin"
                      component={() => (
                        <AdminPanel
                          defaultMetaSnapshotDate={defaultMetaSnapshotDate}
                          snapshotSettings={snapshotSettings}
                          producers={rawProducers}
                          pointSystem={rawPointSystem}
                          isAdmin={
                            adminOverride ||
                            (props.ual.activeUser &&
                              admins.indexOf(
                                props.ual.activeUser.accountName
                              ) !== -1)
                          }
                          minimumTechScore={minimumTechScore}
                          metaSnapshotDate={metaSnapshotDate}
                          formatDate={formatDate}
                        />
                      )}
                    />
                  
                </Paper>
              </Grid>
            </Grid>
          </Container>
          
        </div>
        </div>
        </Router>
      </Switch>
    </React.Fragment>
  );
};

export default App;
