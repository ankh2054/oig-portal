import { useEffect, useState } from 'react';
// import { sentenceCase } from 'change-case';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Table,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
} from '@mui/material';
import { Link } from 'react-router-dom';
// components
import Label from '../Label';
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';

// ----------------------------------------------------------------------

const Community = ({snapresults}) => {
  
  const theme = useTheme();
  
  // const rows = snapresults;
  const firstRow = !!snapresults[0] ? snapresults[0] : {};
  const tableColumns = Object.keys(firstRow).slice(0, 9);
  const tableValues = Object.keys(firstRow).slice(0, 9);

  return (
    <Box>
      <Scrollbar>
        <TableContainer style={{ maxWidth: '500px', maxHeight:'350px' }}>
          <Table>
            <TableHead>
              <TableRow>
                {
                  tableColumns.map(tableColumn => (<TableCell>{tableColumn}</TableCell>))
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {snapresults.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="tableCell">{row.owner_name}</TableCell>
                  <TableCell sx={{ color: `true ? 'green' : 'red'`   }} className="tableCell">
                    <Label
                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                        color={row.cors_check ? 'success' : 'warning'}
                      >
                      {row.cors_check ? 'true' : 'false'}
                    </Label>
                  </TableCell>
                  <TableCell sx={{ padding: '10px' }} className="tableCell">{row.cors_check_error || 'ok'}</TableCell>
                  <TableCell className="tableCell">
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={row.http_check ? 'success' : 'warning'}
                    >
                      {row.http_check ? 'true' : 'false'}
                    </Label>
                  </TableCell>
                  <TableCell sx={{ padding: '10px' }} className="tableCell">{row.http_check_error || 'ok'}</TableCell>
                  <TableCell className="tableCell">
                  <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={row.https_check ? 'success' : 'warning'}
                    >
                    {row.https_check ? 'true' : 'false'}
                    </Label>
                    </TableCell>
                  <TableCell className="tableCell">{row.https_check_error || 'ok'}</TableCell>
                  <TableCell className="tableCell">
                  <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={row.http2_check ? 'success' : 'warning'}
                    >
                    {row.http2_check ? 'true' : 'false'}
                    </Label>
                    </TableCell>
                  <TableCell sx={{ padding: '10px' }} className="tableCell">{row.http2_check_error || 'ok'}</TableCell>
                  <TableCell className="tableCell">
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
      <Link to='/snapshot' style={{textDecoration:'none', color: 'black', fontWeight: '400'}}>
      <Button size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
          View All
      </Button>
      </Link>
      </Box>
    </Box>
  );
}

export default Community 