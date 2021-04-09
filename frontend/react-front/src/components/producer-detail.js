import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { api_base } from '../config'
import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
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
    margin: '0 auto 50px',
  },
  constrainedBox: {
    margin: '0 auto 50px',
    maxWidth: '500px'
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
    ["Security (TLS >= v1.2)", latest.tls_check && latest.tls_check !== "false" && latest.tls_check.indexOf('1.2') !== -1, 'fa fa-shield-alt']
  ]
  const jsx = services.map((item, index) => {
    const iconColor = item[1] === true ? green[500] : item[1] === false ? red[500] : grey[500];
    const serviceName = item[0];
    const iconClass = item[2] ? "fa " + item[2] : item[1] === true ? "fa fa-check-circle" : item[1] === false ? "fa fa-times-circle" : "fa fa-question-circle";

    return <li key={index}>
      <Icon className={iconClass} style={{ color: iconColor }} />&nbsp;
      {serviceName}
    </li>
  }
  )
  return jsx
}

const App = ({ producer, latestresults }) => {
  const classes = useStyles();
  const [results, setResults] = useState([]);

  const preload = 42; // Number of results to preload (21 for 1 page, 42 for 2)

  useEffect(() => {
    if (producer) {
      axios.get(api_base + `/api/paginatedresults/${producer.owner_name}?index=0&limit=${preload-1}`).then((response) => {
        setResults(response.data)
      })
    }
  }, [producer]);


  const loadMoreResults = async (index, limit) => {
    if (!index || !limit) {
      return results
    }
    const paginatedResults = await axios.get(api_base + `/api/paginatedresults/${producer.owner_name}?index=${index}&limit=${limit}`);
    const newResults = [...results, ...paginatedResults.data];
    setResults(newResults);
    return newResults;
  }

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
        <CpuStatsGraph results={results.slice(0, 7)} latestresults={latestresults} />
      </Paper>
      <h2>Latest Results</h2>
      {results.length >= 1 ? <TechresultTables
        passedResults={results}
        hideOwnerName={true}
        loadMoreResults={loadMoreResults}
      /> : null}
    </div>
  )

}
export default App


