import React, { useEffect } from 'react'
// import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ComingSoonIllustration } from '../../assets';
import Scrollbar from '../Scrollbar';
import Iconify from '../../components/Iconify';
import { Link } from 'react-router-dom'



const List = ({latestresults}) => {
  // const latestresults = latestresults.slice(0,8);
  const firstRow = !!latestresults[0] ? latestresults[0] : {};
  const TableColumns = Object.keys(firstRow).slice(0, 9);
  // console.log('KEYS ARE', TableColumns);
 
  return (
    <Scrollbar>
    <TableContainer component={Paper} className="table" style={{ maxWidth: '500px', minWidth: '500px', maxHeight:'350px' }}>
      <Table sx={{ minWidth: 0}} aria-label="simple table">
        <TableHead>
          <TableRow>
            {
              TableColumns.map(row => (
                <TableCell sx={{ fontSize: 11, color: 'green' }} className="tableCell">{row.toUpperCase()}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {latestresults.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tableCell">{row.owner_name}</TableCell>
              <TableCell sx={{ color: `true ? 'green' : 'red'`   }} className="tableCell">{row.cors_check ? 'true' : 'false'}</TableCell>
              <TableCell sx={{ padding: '10px' }} className="tableCell">{row.cors_check_error || 'ok'}</TableCell>
              <TableCell className="tableCell">{row.http_check ? 'true' : 'false'}</TableCell>
              <TableCell sx={{ padding: '10px' }} className="tableCell">{row.http_check_error || 'ok'}</TableCell>
              <TableCell className="tableCell">{row.https_check ? 'true' : 'false'}</TableCell>
              <TableCell className="tableCell">{row.https_check_error || 'ok'}</TableCell>
              <TableCell className="tableCell">{row.http2_check ? 'true' : 'false'}</TableCell>
              <TableCell sx={{ padding: '10px' }} className="tableCell">{row.http2_check_error || 'ok'}</TableCell>
              <TableCell className="tableCell">
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ p: 2, textAlign: 'right' }}>
      <Link to='/latestresults' style={{textDecoration: 'none', color: 'black'}}> 
        <Button size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
          View All
        </Button>
      </Link>
      </Box>
    </Scrollbar>
  );
};

export default List;
