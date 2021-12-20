import React, { useState, useEffect } from "react";
import axios from "axios";
import { api_base } from "../config";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import TechresultTables from "./tech-tablelist-results";
import { green, red, grey } from "@material-ui/core/colors";
import Tooltip from "@material-ui/core/Tooltip";
import Icon from "@material-ui/core/Icon";
import { CpuStatsGraph, cpuSummary } from "./cpu-stats-graph";
import Paper from "@material-ui/core/Paper";
import getCachedImage from "./getCachedImage";
import hyperionV2Logo from "../assets/img/hyperion.png";
import apiLogo from "../assets/img/api.png";
import historyV1Logo from "../assets/img/v1.png";
import atomicLogo from "../assets/img/atomic.png";
import Notification from './Notification.js'

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #e60000",
  },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
  root: {
    "& h1": {
      width: "100%",
      " & small": {
        fontFamily: "monospace",
        display: "block",
      },
    },
    "& h2": {
      width: "100%",
      textAlign: "left",
    },
    width: "100%",
    margin: "0 auto 50px",
  },
  warning: {
    textAlign: "center !important",
  },
  constrainedBox: {
    margin: "0 auto 50px",
    maxWidth: "550px",
  },
  paper: {
    display: "inline-block",
    padding: "0 15px",
    "& h2": {
      marginBlockStart: 0,
      marginBlockEnd: "15px",
      color: theme.palette.text.secondary,
    },
  },
  logoAndFlag: {
    float: "left",
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginBottom: "25px",
    },
    //marginLeft: '21%',
    //marginRight: '25px'
  },
  guildLogo: {
    display: "inline-block",
    width: "100%",
    maxWidth: "90px",
    paddingTop: "15px",
  },
  flagIcon: {
    color: "black",
    display: "inline-block",
    fontSize: "70px",
    width: "100px",
  },
  servicesProvided: {
    display: "inline-block",
    textAlign: "left",
    width: "calc( 100% - 100px - 60px)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    float: "right",
    padding: "15px 40px",
    "& ul": {
      width: "100%",
      listStyleType: "none",
      padding: 0,
      margin: 0,
      "& li": {
        fontSize: "20px",
        padding: "5px 0",
      },
    },
  },
  cpuStatsHolder: {
    textAlign: "left",
    width: "100%",
    padding: "25px",
    margin: "25px 0",
    maxWidth: "1150px",
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  smallCpuStats: {
    margin: "25px 0",
    textAlign: "left",
    padding: "25px",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  backButton: {
    margin: "25px auto",
  },
  hyperionGreen: {
    height: "40px",
    verticalAlign: "middle",
    marginLeft: "-8px",
    display: "inline-block",
    filter:
      "invert(49%) sepia(7%) saturate(3407%) hue-rotate(73deg) brightness(116%) contrast(94%)",
  },
  atomicGreen: {
    height: "38px",
    verticalAlign: "middle",
    marginLeft: "-10px",
    display: "inline-block",
    filter:
      "invert(48%) sepia(62%) saturate(424%) hue-rotate(73deg) brightness(108%) contrast(91%)",
  },
  hyperionRed: {
    height: "40px",
    verticalAlign: "middle",
    marginLeft: "-8px",
    display: "inline-block",
    filter:
      "invert(34%) sepia(78%) saturate(3670%) hue-rotate(344deg) brightness(104%) contrast(91%)",
  },
  atomicRed: {
    height: "38px",
    verticalAlign: "middle",
    marginLeft: "-8px",
    display: "inline-block",
    filter:
      "invert(33%) sepia(91%) saturate(3715%) hue-rotate(345deg) brightness(110%) contrast(91%)",
  },
  hyperionGrey: {
    height: "40px",
    verticalAlign: "middle",
    marginLeft: "-8px",
    display: "inline-block",
    filter:
      "invert(56%) sepia(24%) saturate(0%) hue-rotate(153deg) brightness(104%) contrast(102%)",
  },
  atomicGrey: {
    height: "38px",
    verticalAlign: "middle",
    marginLeft: "-8px",
    display: "inline-block",
    filter:
      "invert(63%) sepia(0%) saturate(0%) hue-rotate(136deg) brightness(102%) contrast(88%)",
  },
  genericIcon: {
    verticalAlign: "middle",
    transform: "scale(1.2)",
    marginRight: "8px",
    display: "inline-block",
  },
  latestResultsTitleWrapper: { 
    display: 'flex',
    alignItems: 'center',
    "& input": {
      height:'40px', 
      width:'90px',
      padding: '10px'
    }
  }
}));

const flagMap = {
  AE: "🇦🇪",
  AU: "🇦🇺",
  BR: "🇧🇷",
  CA: "🇨🇦",
  CN: "🇨🇳",
  DE: "🇩🇪",
  ES: "🇪🇸",
  GB: "🇬🇧",
  HK: "🇭🇰",
  IE: "🇮🇪",
  IN: "🇮🇳",
  JP: "🇯🇵",
  KY: "🇰🇾",
  NL: "🇳🇱",
  PA: "🇵🇦",
  SE: "🇸🇪",
  UA: "🇺🇦",
  US: "🇺🇸",
};

const calculateSecurity = (latest) => {
  const res = {
    producer: latest.producer_api_check === "true",
    net: latest.net_api_check === "true",
    dbsize: latest.dbsize_api_check === "true",
    tls:
      latest.tls_check !== "false" &&
      (latest.tls_check.indexOf("1.2") !== -1 ||
        latest.tls_check.indexOf("1.3") !== -1),
  };
  const success =
    Object.keys(res)
      .flatMap((key) => res[key])
      .indexOf(false) === -1;
  const summary = [
    !res.producer ? "Producer API is enabled" : "",
    !res.net ? "Net API is enabled" : "",
    !res.dbsize ? "DBSize API is enabled" : "",
    !res.tls ? "TLS is either not enabled or below 1.2" : "",
  ]
    .filter((message) => message !== "")
    .join("\n");
  return {
    success,
    summary,
  };
};

const generateServicesProvided = (results, classes) => {
  let latest = results && results[0] ? results[0] : {};
  const security = calculateSecurity(latest);
  const services = [
    [
      "History V1",
      latest.full_history,
      null,
      <img
        alt=""
        src={historyV1Logo}
        className={
          latest.full_history === true
            ? classes.hyperionGreen
            : latest.full_history === false
            ? classes.hyperionRed
            : classes.hyperionGrey
        }
      />,
    ],
    [
      "Hyperion V2",
      latest.hyperion_v2,
      null,
      <img
        alt=""
        src={hyperionV2Logo}
        className={
          latest.hyperion_v2 === true
            ? classes.hyperionGreen
            : latest.hyperion_v2 === false
            ? classes.hyperionRed
            : classes.hyperionGrey
        }
      />,
    ],
    [
      "Atomic API",
      latest.atomic_api,
      null,
      <img
        alt=""
        src={atomicLogo}
        className={
          latest.atomic_api === true
            ? classes.atomicGreen
            : latest.atomic_api === false
            ? classes.atomicRed
            : classes.atomicGrey
        }
      />,
    ],
    [
      "API",
      latest.api_node,
      null,
      <img
        alt=""
        src={apiLogo}
        className={
          latest.api_node === true
            ? classes.hyperionGreen
            : latest.api_node === false
            ? classes.hyperionRed
            : classes.hyperionGrey
        }
      />,
    ],
    ["Missed Blocks (24 hours)", null, null],
    ["Security", security.success, "fa fa-shield-alt"],
  ];

  const jsx = services.map((item, index) => {
    const iconColor =
      item[1] === true ? green[500] : item[1] === false ? red[500] : grey[500];
    const serviceName = item[0];
    const iconClass = item[2]
      ? "fa " + item[2]
      : item[1] === true
      ? "fa fa-check-circle"
      : item[1] === false
      ? "fa fa-times-circle"
      : "fa fa-question-circle";
    const icon = !item[3] ? (
      <Icon
        className={[iconClass, classes.genericIcon]}
        /* Smart use of `style` */ style={{ color: iconColor }}
      />
    ) : (
      item[3]
    );

    return serviceName === "Security" && !security.success ? (
      <HtmlTooltip
        title={security.summary}
        aria-label="summary"
        placement="left"
      >
        <li key={index}>
          {icon}&nbsp;
          {serviceName}
        </li>
      </HtmlTooltip>
    ) : (
      <li key={index}>
        {icon}&nbsp;
        {serviceName}
      </li>
    );
  });
  return jsx;
};

const App = ({
  producer,
  latestresults,
  producerLogos,
  producerDomainMap,
  activeUser,
  metaSnapshotDate,
  openTimeMachine,
}) => {
  const classes = useStyles();
  const [results, setResults] = useState([]);
  const [avgResult, setAvgResult] = useState([]);
  const [numberOfAverageDays, setNumberOfAverageDays] = useState(30)
  const [toastNotification, setToastNotification] = useState({displayFlag: false, msg: ''})

  const preload = 60; // Number of results to preload (21 for 1 page, 42 for 2)

  useEffect(() => {
    if (producer) {
      axios
        .get(
          api_base +
            `/api/truncatedPaginatedResults/${
              producer.owner_name
            }?index=0&limit=${preload - 1}`
        )
        .then((response) => {
          setResults(response.data);
        });
      // Future-proof: add ?month=x, ?year=y to show results for a particular month


      let queryString;
      if(!!metaSnapshotDate){
        queryString = `/api/monthlyaverageresults/${producer.owner_name}?month=${metaSnapshotDate.month}&year=${metaSnapshotDate.year}`; 
      }else{
        queryString = `/api/monthlyaverageresults/${producer.owner_name}?days=${numberOfAverageDays}`; 
      }
      axios
        .get(api_base + queryString)
        .then((response) => {
          setAvgResult(response.data);
        });
    }
  }, [producer, metaSnapshotDate, numberOfAverageDays]);

  const loadMoreResults = async (index, limit) => {
    if (!index || !limit) {
      return results;
    }
    const paginatedResults = await axios.get(
      api_base +
        `/api/truncatedPaginatedResults/${producer.owner_name}?index=${index}&limit=${limit}`
    );
    const newResults = [...results, ...paginatedResults.data];
    setResults(newResults);
    return newResults;
  };

  const updateAverageDays = (e) => {
    if(e.target.value < 1000){
      setNumberOfAverageDays(e.target.value)
    }else{
      alert("Number of Average days must not exceed 1000")
    }
    
  }

  return (
    <div className={classes.root}>
      {producer ? (
        <h1>
          {producer.candidate} <small>{producer.owner_name}</small>
        </h1>
      ) : null}
      {results.length === 0 ? (
        <h2 className={classes.warning}>
          No data recorded for this guild yet.
        </h2>
      ) : !producer.active ? (
        <h2 className={classes.warning}>This guild is retired.</h2>
      ) : activeUser && activeUser.accountName === producer.account_name ? (
        <h2 className={classes.warning}>This is your guild.</h2>
      ) : null}
      <div className={classes.constrainedBox}>
        {producer && (producer.logo_svg || producer.country_code) ? (
          <Paper
            className={[classes.paper, classes.logoAndFlag]}
            variant="outlined"
          >
            {producerLogos ? (
              <img
                alt={producer.candidate + " logo"}
                className={classes.guildLogo}
                src={getCachedImage(
                  producer.logo_svg,
                  producerLogos,
                  producerDomainMap
                )}
              />
            ) : null}
            <br />
            {flagMap[producer.country_code] ? (
              <span className={classes.flagIcon}>
                {flagMap[producer.country_code]}
              </span>
            ) : null}
          </Paper>
        ) : null}
        {results.length >= 1 ? (
          <Paper
            className={[classes.paper, classes.servicesProvided]}
            variant="outlined"
          >
            <h2>Services Provided</h2>
            <ul>{generateServicesProvided(results, classes)}</ul>
          </Paper>
        ) : null}
      </div>
      {results.length >= 1 ? (
        <Paper
          className={[classes.paper, classes.cpuStatsHolder]}
          variant="outlined"
        >
          <h2>CPU stats</h2>
          <CpuStatsGraph
            results={results.slice(0, 7)}
            latestresults={latestresults}
          />
        </Paper>
      ) : null}
      {results.length >= 1 ? (
        <Paper
          className={[classes.paper, classes.smallCpuStats]}
          variant="outlined"
        >
          <h2>CPU stats</h2>
          <p>{cpuSummary({ results: results.slice(0, 7), latestresults })}</p>
        </Paper>
      ) : null}
      {results.length >= 1 ? 
      <div className={classes.latestResultsTitleWrapper}>
        <h2>Latest Results</h2>
        <>Average Days
        <input
          label="Number"
          type="number"   
          value={!metaSnapshotDate ? numberOfAverageDays : '--'} 
          onChange={updateAverageDays}      
          min={1}
          max={1000}
         
        />
        </>
      </div> 
      : null}
      {results.length >= 1 ? (
        <TechresultTables
          passedResults={results}
          avgResult={avgResult}
          metaSnapshotDate={metaSnapshotDate}
          openTimeMachine={openTimeMachine}
          hideOwnerName={true}
          loadMoreResults={loadMoreResults}
        />
      ) : null}
    </div>
  );
};
export default App;
