import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { green, red } from '@material-ui/core/colors';
import Icon from '@material-ui/core/Icon';




import WAXsvg from "../assets/img/logo-wax";


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
  }
}));

/*

cpu_time: "1.36"
date_check: "2020-08-27T12:10:52.789Z"
*/



export default function ResultTables({ results }) {
    console.log(results)


 const iconResult = (result) => {
        return(
          <>
            {result
            // Font-awesome icons
              ? <Icon className="fa fa-check-circle" style={{ color: green[500] }} />
              : <Icon className="fa fa-times-circle" style={{ color: red[500] }} />
            }
          </>
        );
  }

  const classes = useStyles();
  return (
    <>
    <Paper className={classes.paper} elevation={3}>
      <Grid container spacing={3}>
        <Grid item xs={3} md={1}>
          <Box position="left" align="left">
            <WAXsvg style={{ fontSize: 70 }}/>
          </Box>
        </Grid>
        <Grid item xs={3} md={1}>
          <Typography component="div">
            <Box className={classes.textcolour} align="left" fontSize="h4.fontSize" fontWeight="fontWeightBold"  m={1} color="text.disabled">
            </Box>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
   
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
            <StyledTableCell align="right">http2_check</StyledTableCell>
            <StyledTableCell align="right">full_history</StyledTableCell>
            <StyledTableCell align="right">cors_check</StyledTableCell>
            <StyledTableCell align="right">oracle_feed</StyledTableCell>
            <StyledTableCell align="right">snapshots</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {results.map((result) => (
            <StyledTableRow key={result.Key}>
              <StyledTableCell component="th" scope="row">{result.owner_name}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.chains_json)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.wax_json)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.api_node)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.seed_node)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.http_check)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.http2_check)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.full_history)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.cors_check)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.oracle_feed)}</StyledTableCell>
              <StyledTableCell align="right">{iconResult(result.snapshots)}</StyledTableCell>

            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}


