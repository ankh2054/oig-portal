import React from 'react'
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import { Container, Grid, Box } from '@mui/material';
import SnapshotResults from "../../components/snapsresults/SnapshotResults"
import Top21 from "../../components/top21/Top21"
import Table from "../../components/table/Table";
import CardHeader from "@mui/material/CardHeader";
import AppWelcome from "../../components/appwelcome/Appwelcome";
import Currentdownload from "../../components/currentdownload/Currentdownload";
import EcommerceWidgetSummary from '../../components/ecommerceWidgetSummary/EcommerceWidgetSummary'
import Bizdevs from '../../components/bizdevs/Bizdevs';
import Community from '../../components/community/Community';
const Home = ({latestresults, top21Guilds, snapresults, bizdevs, community, activeUser, producers, products}) => {

  const uniqueTop21Guilds = top21Guilds.filter((a, i) => top21Guilds.findIndex((s) => a.owner_name === s.owner_name) === i)
  const uniqueProducers = producers.filter((a, i) => producers.findIndex((s) => a.owner_name === s.owner_name) === i)
  // console.log('bizdevs', bizdevs)
  console.log('proucers', uniqueProducers)
  return (
    // <div className="home">
      <Container maxWidth={'xl'} style={{marginBottom: '2rem'}}>
        <Grid container>
          <Grid item xs={12} md={12} mb={3}>
            <Navbar />
          </Grid>
          <Grid container my={10} spacing={5}>
            <Grid item xs={12} md={6} mb={5}>
              <AppWelcome activeUser={activeUser}/>
            </Grid>
            <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}>
              <CardHeader title="Latest Results" sx={{ mb: 3 }} />
              <Table latestresults={latestresults.slice(0, 10)}/>
            </Grid>
          </Grid>
          </Grid>
          <Grid container my={7}>
          <Grid item xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Top 21 Guilds"
              percent={0}
              total={uniqueTop21Guilds.length}
              // chartColor={theme.palette.primary.main}
              chartColor={'gray'}
              chartData={[22, 8, 35, 50, 82, 84, 77, 12, 87, 43]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Unique Producers"
              percent={0}
              total={uniqueProducers.length}
              // chartColor={theme.palette.chart.green[0]}
              chartColor={'green'}
              chartData={[56, 47, 40, 62, 73, 30, 23, 54, 67, 68]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <EcommerceWidgetSummary
              title="Total Products"
              percent={0}
              total={products.length}
              chartColor={'red'}
              chartData={[40, 70, 75, 70, 50, 28, 7, 64, 38, 27]}
            />
          </Grid>
          </Grid>
          <Grid container my={8} spacing={5}>
          {/* <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}>
            <CardHeader title="Latest Results" sx={{ mb: 3 }} />
            <Table latestresults={latestresults.slice(0, 10)}/>
          </Grid> */}
          {/* <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}> 
            <SnapshotResults snapresults={snapresults.slice(0, 10)} />
          </Grid> */}
        </Grid>
          <Grid container my={7}>
            {/* <Grid item xs={12} md={6}>
              <Currentdownload />
            </Grid > */}
            <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}> 
            <SnapshotResults snapresults={snapresults.slice(0, 10)} />
          </Grid>
            <Grid item xs={12} md={6}>
              <Top21 top21Guilds={uniqueTop21Guilds}/>
            </Grid>
          </Grid>
        <Grid container my={10} spacing={5}>
          <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}>
            <CardHeader title="Community" sx={{ mb: 3 }} />
            <Community snapresults={snapresults.slice(0, 10)}/>
          </Grid>
          <Grid item xs={12} md={6} style={{boxShadow: '1px 1px 1px 1px lightgray'}}> 
          <Bizdevs snapresults={snapresults.slice(0, 10)} />
          </Grid>
        </Grid>
        {/* <Grid container>
          <Grid item xs={9} md={8}>
            <Graph />
          </Grid>
        </Grid> */}
      </Container>
      
    // </div>
  );
};

export default Home;
