import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { api_base } from '../config'
import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
import { green, red, grey } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';
import { CpuStatsGraph, cpuSummary } from './cpu-stats-graph';
import Paper from '@material-ui/core/Paper';
import getCachedImage from './getCachedImage';
import hyperionV2Logo from '../assets/img/hyperion.png';
import apiLogo from '../assets/img/api.png';
import historyV1Logo from '../assets/img/v1.png';

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
  warning: {
    textAlign: 'center !important'
  },
  constrainedBox: {
    margin: '0 auto 50px',
    maxWidth: '550px'
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
    [theme.breakpoints.down("sm")]: {
      width: '100%',
      marginBottom: '25px'
    }
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
    [theme.breakpoints.down("sm")]: {
      width: '100%',
    },
    float: 'right',
    padding: '15px 40px',
    '& ul': {
      width: '100%',
      listStyleType: 'none',
      padding: 0,
      margin: 0,
      '& li': {
        fontSize: '20px',
        padding: '5px 0'
      }
    },
  },
  cpuStatsHolder: {
    textAlign: 'left',
    width: '100%',
    padding: '25px',
    margin: '25px 0',
    maxWidth: '1150px',
    [theme.breakpoints.down("xs")]: {
      display: 'none'
    }
  },
  smallCpuStats: {
    margin: '25px 0',
    textAlign: 'left',
    padding: '25px',
    width: '100%',
    [theme.breakpoints.up("sm")]: {
      display: 'none'
    }
  },
  backButton: {
    margin: '25px auto'
  },
  hyperionGreen: {
    height: '40px',
    verticalAlign: 'middle',
    marginLeft: '-8px',
    display: 'inline-block',
    filter: 'invert(49%) sepia(7%) saturate(3407%) hue-rotate(73deg) brightness(116%) contrast(94%)',
  },
  hyperionRed: {
    height: '40px',
    verticalAlign: 'middle',
    marginLeft: '-8px',
    display: 'inline-block',
    filter: 'invert(34%) sepia(78%) saturate(3670%) hue-rotate(344deg) brightness(104%) contrast(91%)',
  },
  hyperionGrey: {
    height: '40px',
    verticalAlign: 'middle',
    marginLeft: '-8px',
    display: 'inline-block',
    filter: 'invert(56%) sepia(24%) saturate(0%) hue-rotate(153deg) brightness(104%) contrast(102%)',
  },
  genericIcon: {
    verticalAlign: 'middle',
    transform: 'scale(1.2)',
    marginRight: '8px',
    display: 'inline-block'
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

const generateServicesProvided = (results, classes) => {
  let latest = results && results[0] ? results[0] : {};
  console.log(latest)
  const services = [
    ["History V1", latest.full_history, null, <img alt="" src={historyV1Logo} className={latest.full_history === true ? classes.hyperionGreen : latest.full_history === false ? classes.hyperionRed : classes.hyperionGrey}/>],
    ["Hyperion V2", latest.hyperion_v2, null, <img alt="" src={hyperionV2Logo} className={latest.hyperion_v2 === true ? classes.hyperionGreen : latest.hyperion_v2 === false ? classes.hyperionRed : classes.hyperionGrey}/>],
    ["Atomic API", latest.atomic_api, null],
    ["API", latest.api_node, null, <img alt="" src={apiLogo} className={latest.api_node === true ? classes.hyperionGreen : latest.api_node === false ? classes.hyperionRed : classes.hyperionGrey}/>],
    ["Missed Blocks (24 hours)", null, null],
    ["Security (TLS >= v1.2)", latest.tls_check && latest.tls_check !== "false" && latest.tls_check.indexOf('1.2') !== -1, 'fa fa-shield-alt']
  ]

  const jsx = services.map((item, index) => {
    const iconColor = item[1] === true ? green[500] : item[1] === false ? red[500] : grey[500];
    const serviceName = item[0];
    const iconClass = item[2] ? "fa " + item[2] : item[1] === true ? "fa fa-check-circle" : item[1] === false ? "fa fa-times-circle" : "fa fa-question-circle";

    const icon = !item[3] ? <Icon className={[iconClass, classes.genericIcon]} /* Smart use of `style` */ style={{ color: iconColor }} /> : item[3];

    return <li key={index}>
      {icon}&nbsp;
      {serviceName}
    </li>
  }
  )
  return jsx
}

const App = ({ producer, latestresults, producerLogos, producerDomainMap, activeUser }) => {
  const classes = useStyles();
  const [results, setResults] = useState([]);

  const preload = 60; // Number of results to preload (21 for 1 page, 42 for 2)

  useEffect(() => {
    if (producer) {
      axios.get(api_base + `/api/truncatedPaginatedResults/${producer.owner_name}?index=0&limit=${preload - 1}`).then((response) => {
        setResults(response.data)
      })
    }
  }, [producer]);


  const loadMoreResults = async (index, limit) => {
    if (!index || !limit) {
      return results
    }
    const paginatedResults = await axios.get(api_base + `/api/truncatedPaginatedResults/${producer.owner_name}?index=${index}&limit=${limit}`);
    const newResults = [...results, ...paginatedResults.data];
    setResults(newResults);
    return newResults;
  }

  return (
    <div className={classes.root}>
      {producer ? <h1>{producer.candidate} <small>{producer.owner_name}</small></h1> : null}
      {results.length === 0 ? <h2 className={classes.warning}>No data recorded for this guild yet.</h2> : !producer.active ? <h2 className={classes.warning}>This guild is retired.</h2> : activeUser && activeUser.accountName === producer.account_name ? <h2 className={classes.warning}>This is your guild.</h2> : null}
      <div className={classes.constrainedBox}>
        {producer && (producer.logo_svg || producer.country_code) ? <Paper className={[classes.paper, classes.logoAndFlag]} variant="outlined">
          {producerLogos ? <img alt={producer.candidate + " logo"} className={classes.guildLogo} src={getCachedImage(producer.logo_svg, producerLogos, producerDomainMap)} /> : null}
          <br />
          {flagMap[producer.country_code] ? <span className={classes.flagIcon}>
            {flagMap[producer.country_code]}
          </span> : null}
        </Paper> : null}
        {results.length >= 1 ? <Paper className={[classes.paper, classes.servicesProvided]} variant="outlined">
          <h2>Services Provided</h2>
          <ul>
            {generateServicesProvided(results, classes)}
          </ul>
        </Paper> : null}
      </div>
      {results.length >= 1 ? <Paper className={[classes.paper, classes.cpuStatsHolder]} variant="outlined">
        <h2>CPU stats</h2>
        <CpuStatsGraph results={results.slice(0, 7)} latestresults={latestresults} />
      </Paper> : null}
      {results.length >= 1 ? <Paper className={[classes.paper, classes.smallCpuStats]} variant="outlined">
        <h2>CPU stats</h2>
        <p>{cpuSummary({ results: results.slice(0, 7), latestresults })}</p>
      </Paper> : null}
      {results.length >= 1 ? <h2>Latest Results</h2> : null}
      {results.length >= 1 ? <TechresultTables
        passedResults={results}
        hideOwnerName={true}
        loadMoreResults={loadMoreResults}
      /> : null}
    </div>
  )

}
export default App


