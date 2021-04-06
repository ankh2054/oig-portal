import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { green, red } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';
import datec from '../functions/date'
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
// import { getTechScore } from '../functions/scoring'

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #e60000',
  },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.text.primary,
    marginBottom: 10,
    marginTop: 60
  },
  pageButton: {
    display: 'inline-block',
    margin: '25px 5px'
  },
  table: {
    minWidth: 400,
    '& th': {
      padding: '30px 0',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
      '& span': {
        transform: 'rotate(315deg)',
        display: 'inline-block'
      }
    },
    '& td': {
      padding: '7px 4px',
      textAlign: 'center',
      borderLeft: '1px solid rgb(224, 224, 224)',
    }
  },
  waxButton: {
    textDecoration: 'none',
    color: '#332b1f',
    borderRadius: '100px',
    fontWeight: 'bold',
    padding: '15px 20px',
    background: 'linear-gradient(90.08deg, rgb(247, 142, 30), rgb(255, 220, 81) 236.03%)',
    '&:hover': {
      background: 'linear-gradient(275.91deg, rgb(247, 142, 30) 8.43%, rgb(255, 220, 81) 174.56%)'
    }
  },
  ownerName: {
    borderLeft: 'none',
    padding: '0 5px',
    '& a.waxButton': {
      padding: '10px'
    }
  },
  textcolour: {
    color: 'white'
  },
  red: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  green: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
}));

export default function ResultTables({ passedResults, hideOwnerName, loadMoreResults }) {
  // Basic paginaton frontend setup - 21 results
  const initialIndex = 21;
  const [results, setResults] = useState(passedResults);
  const [resultSlice, setResultSlice] = useState(passedResults.slice(0, initialIndex))
  const [resultIndex, setResultIndex] = useState(initialIndex)
  const [fetchForwardLimit, setFetchForwardLimit] = useState(!hideOwnerName)

  const getMax = (passedResults) => {
    const rows = passedResults ? passedResults : results;
    return rows.length - 1;
  }

  const changePage = async (direction) => {
    const min = 0;
    let max = getMax();
    if (direction === "next") {
      let rows = results;
      const draftEndSlice = resultIndex + initialIndex - 1; // 21-1 initially. Then 42-1, and 63-1
      let endSlice = draftEndSlice >= max ? max : draftEndSlice; // set end slice to (20+21) - row 42, (41+21) - row 63, or (62+21) - row 84 - if it exceeds the loaded max (41) - row 42 use that instead
      if (draftEndSlice >= (max+1) && !fetchForwardLimit) { // X >= 42 (row 43) initially
        const index = endSlice + 1; // 41+1 (row 43)
        const limit = draftEndSlice; // 63-1 on third press (row 63)
        rows = await loadMoreResults(index, limit); // index 42-62 (row 43-64) should be now appended
        max = getMax(rows) // new max of index 63 (row 64) should be returned
        setResults(rows)
        endSlice = draftEndSlice >= max ? max : draftEndSlice; // new end slice should be set to either the new max (62 - r63) or the draft end slice (63-1 - r63)
        if (draftEndSlice >= max) {
          console.log("Pagination limit reached...")
          setFetchForwardLimit(true)
        }
      }
      const startSlice = endSlice - initialIndex + 1; // (20+21) - 21 = 20+1 (r22) (41+21) - 21 = 41+1 (r43)
      setResultSlice(rows.slice(startSlice, endSlice + 1)); // 22 - 42
      setResultIndex(endSlice)
    }
    if (direction === "previous") {
      const previousIndex = resultIndex - initialIndex - 1;
      const endSlice = previousIndex > (min + initialIndex) ? previousIndex : min + initialIndex;
      const startSlice = endSlice - initialIndex;
      setResultSlice(results.slice(startSlice, endSlice));
      setResultIndex(endSlice)
    }
  }

  const iconResult = (result) => {
    return (
      <>
        {result
          // Font-awesome icons
          ? <Icon className="fa fa-check-circle" style={{ color: green[500] }} />
          : <Icon className="fa fa-times-circle" style={{ color: red[500] }} />
        }
      </>
    );
  }

  const textResult = (result) => {
    if (result === 'TLSv1.3' || result === 'TLSv1.2') {
      return (
        <Avatar className={classes.green}>{result.slice(4, 7)}</Avatar>

      );
    } if (result == null) {
      return (
        <Avatar className={classes.green}>{result}</Avatar>

      );
    } else {
      return (
        <Avatar className={classes.red}>{result.slice(4, 7)}</Avatar>
      );
    }
  }

  // This function is called like 20 times before any computation!
  // However luckily, 'only' twice after it gets down to rendering.
  // console.log(`tech-tablelist-results loaded. ${!pointSystem ? "pointSystem not found, so we won't be calculating scores" : "pointSystem found, so we will be calculating scores."}`)

  const classes = useStyles();
  return (
    <>
      <TableContainer component={Paper} /* className={classes.tableroot} */>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              {hideOwnerName === true ? null : <StyledTableCell>owner_name</StyledTableCell>}
              <StyledTableCell><span>chains_json</span></StyledTableCell>
              <StyledTableCell><span>wax_json</span></StyledTableCell>
              <StyledTableCell><span>api_node</span></StyledTableCell>
              <StyledTableCell><span>seed_node</span></StyledTableCell>
              <StyledTableCell><span>http_check</span></StyledTableCell>
              <StyledTableCell><span>https_check</span></StyledTableCell>
              <StyledTableCell><span>tls_ver</span></StyledTableCell>
              <StyledTableCell><span>http2_check</span></StyledTableCell>
              <StyledTableCell><span>history_v1</span></StyledTableCell>
              <StyledTableCell><span>hyperion_v2</span></StyledTableCell>
              <StyledTableCell><span>cors_check</span></StyledTableCell>
              <StyledTableCell><span>oracle_feed</span></StyledTableCell>
              <StyledTableCell><span>snapshots</span></StyledTableCell>
              <StyledTableCell><span>cpu</span></StyledTableCell>
              <StyledTableCell><span>score</span></StyledTableCell>
              <StyledTableCell>date (gmt)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultSlice.map((result) => (
              <StyledTableRow key={result.Key}>
                {hideOwnerName === true ? null : <StyledTableCell className={classes.ownerName}><a className={classes.waxButton} href={`/guilds/${result.owner_name}`}>{result.owner_name}</a></StyledTableCell>}
                <StyledTableCell>{iconResult(result.chains_json)}</StyledTableCell>
                <StyledTableCell>{iconResult(result.wax_json)}</StyledTableCell>
                <HtmlTooltip title={result.api_node_error} aria-label="api_node_error" placement="top">
                  <StyledTableCell>{iconResult(result.api_node)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.seed_node_error} aria-label="seed_node_error" placement="top">
                  <StyledTableCell>{iconResult(result.seed_node)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.http_check_error} aria-label="http_check_error" placement="top">
                  <StyledTableCell>{iconResult(result.http_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.https_check_error} aria-label="https_check_error" placement="top">
                  <StyledTableCell>{iconResult(result.https_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.https_check_error} aria-label="tls_check_error" placement="top">
                  <StyledTableCell>{textResult(result.tls_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.http2_check_error} aria-label="http2_check_error" placement="top">
                  <StyledTableCell>{iconResult(result.http2_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.full_history_error} aria-label="full_history_error" placement="top">
                  <StyledTableCell>{iconResult(result.full_history)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.full_history_error} aria-label="hyperion_v2_error" placement="top">
                  <StyledTableCell>{iconResult(result.hyperion_v2)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.cors_check_error} aria-label="cors_check_error" placement="top">
                  <StyledTableCell>{iconResult(result.cors_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.oracle_feed_error} aria-label="oracle_feed_error" placement="top">
                  <StyledTableCell>{iconResult(result.oracle_feed)}</StyledTableCell>
                </HtmlTooltip>
                <StyledTableCell>{iconResult(result.snapshots)}</StyledTableCell>
                <StyledTableCell>{result.cpu_avg}</StyledTableCell>
                <StyledTableCell>{Math.round(result.score) /* !pointSystem ? result.score : getTechScore(result, pointSystem) */}</StyledTableCell>
                <StyledTableCell>{datec(result.date_check)}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button className={[classes.waxButton, classes.pageButton]} onClick={() => changePage('previous')}>BACK</Button>
      <Button className={[classes.waxButton, classes.pageButton]} onClick={() => changePage('next')}>FORWARD</Button>
    </>
  );
}


