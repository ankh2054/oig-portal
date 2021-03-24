import React from 'react'
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
import Button from '@material-ui/core/Button';
import { green, red, grey } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';
import CpuStatsGraph from './cpu-stats-graph';
import Paper from '@material-ui/core/Paper';


const useStyles = makeStyles((theme) => ({
  root: {
    '& h1': {
      width: '100%',
      ' & small': {
        fontFamily: 'monospace',
        display: 'block'
      },
    },
    '& h2': {
      width: '100%', 
      textAlign: 'left'
    },
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto 50px'
  },
  paper: {
    display: 'inline-block',
    padding: '0 15px',
    '& h2': {
      marginBlockStart: 0,
      marginBlockEnd: '15px',
      color: theme.palette.text.secondary
    },
  },
  logoAndFlag: {
    float: 'left',
    textAlign: 'center',
    //marginLeft: '21%',
    //marginRight: '25px'
  },
  guildLogo: {
    display: 'inline-block',
    width: '100%',
    maxWidth: '90px',
    paddingTop: '15px'
  },
  flagIcon: {
    color: 'black',
    display: 'inline-block',
    fontSize: '70px',
    width: '100px'
  },
  servicesProvided: {
    display: 'inline-block',
    textAlign: 'left',
    width: 'calc( 100% - 100px - 60px)',
    float: 'right',
    padding: '15px 40px',
    '& ul': {
      width: '100%',
      listStyleType: 'none',
      padding: 0,
      margin: 0,
      '& li': {
        fontSize: '20px'
      }
    },
  },
  cpuStatsHolder: {
    textAlign: 'left',
    width: '100%',
    padding: '25px',
    margin: '25px 0'
  },
  backButton: {
    margin: '25px auto'
  }
}));

const flagMap = {
  "AE": "🇦🇪",
  "AU": "🇦🇺",
  "BR": "🇧🇷",
  "CA": "🇨🇦",
  "CN": "🇨🇳",
  "DE": "🇩🇪",
  "ES": "🇪🇸",
  "GB": "🇬🇧",
  "HK": "🇭🇰",
  "IE": "🇮🇪",
  "IN": "🇮🇳",
  "JP": "🇯🇵",
  "KY": "🇰🇾",
  "NL": "🇳🇱",
  "PA": "🇵🇦",
  "SE": "🇸🇪",
  "UA": "🇺🇦",
  "US": "🇺🇸"
}

const generateServicesProvided = (results) => {
  let latest = results && results[0] ? results[0] : {};
  const services = [
    ["History V1", latest.hyperion_v2, null],
    ["Hyperion V2", latest.hyperion_v2, null],
    ["API", latest.api_node, null],
    ["Missed Blocks (24 hours)", null, null],
    ["Security", latest.tls_check && latest.tls_check !== "false", 'fa fa-shield-alt']
  ]
  const jsx = services.map((item, index) => {
    const iconColor = item[1] === true ? green[500] : item[1] === false ? red[500] : grey[500];
    const serviceName = item[0];
    const iconClass = item[2] ? "fa " + item[2] : "fa fa-check-circle";

    return <li key={index}>
      <Icon className={iconClass} style={{ color: iconColor }} />&nbsp;
      {serviceName}
    </li>
  }
  )
  return jsx
}

const App = ({ producer, results, pointSystem }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {producer ? <h1>{producer.candidate} <small>{producer.owner_name}</small></h1> : null}
      <Paper className={[classes.paper, classes.logoAndFlag]} variant="outlined">
        {producer ? <img alt={producer.candidate + " logo"} className={classes.guildLogo} src={producer.logo_svg} /> : null}
        <br />
        {producer && flagMap[producer.country_code] ? <span className={classes.flagIcon}>
          {flagMap[producer.country_code]}
        </span> : null}
      </Paper>
      <Paper className={[classes.paper, classes.servicesProvided]} variant="outlined">
        <h2>Services Provided</h2>
        <ul>
          {generateServicesProvided(results)}
        </ul>
      </Paper>
      <Paper className={[classes.paper, classes.cpuStatsHolder]} variant="outlined">
      <h2>CPU stats</h2>
      <CpuStatsGraph results={results.slice(0, 7)} />
      </Paper>
      <h2>Latest Results</h2>
      <TechresultTables
        results={results}
        pointSystem={pointSystem}
        description="Wax Mainnet"
      />
      <Link to={`/`}>
        <Button variant="contained" className={classes.backButton} color="primary" >
          Back
        </Button>
      </Link>
    </div>
  )

}
export default App


