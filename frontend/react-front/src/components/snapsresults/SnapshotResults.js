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
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  IconButton,
  TableContainer,
} from '@mui/material';
import { Link } from 'react-router-dom'
// utils
import { fCurrency } from '../../utils/formatNumber';
// _mock_
// import { _appInvoices } from '../../../../_mock';
// components
import Label from '../Label';
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';

// ----------------------------------------------------------------------

const SnapshotResults = ({snapresults}) => {

  const theme = useTheme();
  const firstRow = !!snapresults[0] ? snapresults[0] : {};
  const tableColumns = Object.keys(firstRow).slice(0, 9);

  return (
    <Box sx={{ maxWidth: 400 }}>
      <CardHeader title="New Invoice" sx={{ mb: 3 }} />
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
          View All
      </Link>
      </Box>
    </Box>
  );
}

export default SnapshotResults 