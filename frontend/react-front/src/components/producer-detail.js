import React from 'react'
import { Link } from 'react-router-dom';
// Ununused var // import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
//import ProdBizdev from './product-bizdev-results'
import Button from '@material-ui/core/Button';
import { green, red, grey } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';
import CpuStatsGraph from './cpu-stats-graph'

// Ununused var // 
/* const useStyles = makeStyles((theme) => ({
  root: {
    
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  left: {
    marginLeft: 'auto',
  },
})); */

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
    ["Missed Blocks (24 hours)", true, null],
    ["Security", latest.tls_check && latest.tls_check !== "false", 'fa fa-shield-alt']
  ]
  const jsx = services.map((item, index) => {
    const iconColor = item[1] === true ? green[500] : item[1] === false ? red[500] : grey[500];
    const serviceName = item[0];
    const iconClass = item[2] ? "fa " + item[2] : "fa fa-check-circle";

    return <li style={{ fontSize: '20px' }} key={index}>
      <Icon className={iconClass} style={{ color: iconColor }} />&nbsp;
      {serviceName}
    </li>
  }
  )
  return jsx
}

const App = ({ producer, results, pointSystem }) => {
  // Ununused var // const classes = useStyles();

  return (
    <div>
      {producer ? <h1 style={{ width: '100%' }}>{producer.candidate} <small style={{ fontFamily: 'monospace', display: 'block' }}>{producer.owner_name}</small></h1> : null}
      {/* BP Logo and flag */}
      <div style={{ display: 'inline-block', textAlign: 'center', float: 'left', width: '20%', marginLeft: '5%', minHeight: '100px' }}>
        {producer ? <img alt={producer.candidate + " logo"} style={{ display: 'inline-block', width: '100%', maxWidth: '90px' }} src={producer.logo_svg} /> : null}
        <br />
        {producer && flagMap[producer.country_code] ? <span style={{ color: 'black', display: 'inline-block', fontSize: '70px', width: '100px' }}>
          {flagMap[producer.country_code]}
        </span> : null}
      </div>
      {/* Services provided */}
      <div style={{ display: 'inline-block', textAlign: 'left', float: 'right', width: '60%', marginRight: '5%', minHeight: '100px' }}>
        <h2 style={{ marginBlockStart: 0, marginBlockEnd: '15px', border: '1px solid rgba(0, 0, 0, 0.54)', padding: '5px' }}>Services Provided</h2>
        <ul style={{ width: '100%', listStyleType: 'none', 'padding': 0, margin: 0 }}>
          {generateServicesProvided(results)}
        </ul>
      </div>
      {/* CPU graph */}
      <div style={{ display: 'block', textAlign: 'left', width: '100%', float: 'left', marginBottom: '20px' }}>
        <div style={{ display: 'inline-block', width: '800px', marginTop: '20px', marginLeft: '5%', minHeight: '100px' }}>
          <div style={{ display: 'block', width: '100%', minHeight: '300px', border: '1px solid rgba(0, 0, 0, 0.54)' }}>
            <CpuStatsGraph results={results.slice(0,7)} />
          </div>
          <h2 style={{ marginBlockStart: 0, marginBlockEnd: 0, border: '1px solid rgba(0, 0, 0, 0.54)', padding: '5px' }}>CPU stats</h2>
        </div>
      </div>
      <h2 style={{ float: 'left', width: '100%', textAlign: 'left' }}>Latest Results</h2>
      <TechresultTables
        results={results}
        pointSystem={pointSystem}
        description="Wax Mainnet"
      />
      <Link to={`/`}>
        <Button variant="contained" color="primary" >
          Back
        </Button>
      </Link>
    </div>
  )

}
export default App


