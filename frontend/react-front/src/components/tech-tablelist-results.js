import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
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
import { getTechScore } from '../functions/scoring'

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
  table: {
    minWidth: 400,
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

export default function ResultTables({ results, pointSystem }) {

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
  console.log(`tech-tablelist-results loaded. ${!pointSystem ? "pointSystem not found, so we won't be calculating scores" : "pointSystem found, so we will be calculating scores."}`)

  const classes = useStyles();
  return (
    <>
      <TableContainer component={Paper} className={classes.tableroot}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>owner_name</StyledTableCell>
              <StyledTableCell align="right">chains_json</StyledTableCell>
              <StyledTableCell align="right">wax_json</StyledTableCell>
              <StyledTableCell align="right">api_node</StyledTableCell>
              <StyledTableCell align="right">seed_node</StyledTableCell>
              <StyledTableCell align="right">http_check</StyledTableCell>
              <StyledTableCell align="right">https_check</StyledTableCell>
              <StyledTableCell align="right">tls_ver</StyledTableCell>
              <StyledTableCell align="right">http2_check</StyledTableCell>
              <StyledTableCell align="right">history_v1</StyledTableCell>
              <StyledTableCell align="right">hyperion_v2</StyledTableCell>
              <StyledTableCell align="right">cors_check</StyledTableCell>
              <StyledTableCell align="right">oracle_feed</StyledTableCell>
              <StyledTableCell align="right">snapshots</StyledTableCell>
              <StyledTableCell align="right">cpu</StyledTableCell>
              <StyledTableCell align="right">Score</StyledTableCell>
              <StyledTableCell align="right">Date</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <StyledTableRow key={result.Key}>
                <Link to={`/guilds/${result.owner_name}`}>
                  <StyledTableCell component="th" scope="row">{result.owner_name}</StyledTableCell>
                </Link>
                <StyledTableCell align="right">{iconResult(result.chains_json)}</StyledTableCell>
                <StyledTableCell align="right">{iconResult(result.wax_json)}</StyledTableCell>
                <HtmlTooltip title={result.api_node_error} aria-label="api_node_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.api_node)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.seed_node_error} aria-label="seed_node_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.seed_node)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.http_check_error} aria-label="http_check_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.http_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.https_check_error} aria-label="https_check_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.https_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.https_check_error} aria-label="tls_check_error" placement="top">
                  <StyledTableCell align="right">{textResult(result.tls_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.http2_check_error} aria-label="http2_check_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.http2_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.full_history_error} aria-label="full_history_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.full_history)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.full_history_error} aria-label="hyperion_v2_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.hyperion_v2)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.cors_check_error} aria-label="cors_check_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.cors_check)}</StyledTableCell>
                </HtmlTooltip>
                <HtmlTooltip title={result.oracle_feed_error} aria-label="oracle_feed_error" placement="top">
                  <StyledTableCell align="right">{iconResult(result.oracle_feed)}</StyledTableCell>
                </HtmlTooltip>
                <StyledTableCell align="right">{iconResult(result.snapshots)}</StyledTableCell>
                <StyledTableCell align="right">{result.cpu_avg}</StyledTableCell>
                <StyledTableCell align="right">{!pointSystem ? result.score : getTechScore(result, pointSystem)}</StyledTableCell>
                <StyledTableCell align="right">{datec(result.date_check)}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}


