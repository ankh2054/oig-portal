import React, { useState } from 'react';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import { api_base } from "../config";
import axios from "axios";
import TableDataGrid from './table-datagrid'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
require('moment-timezone')

moment.tz.setDefault('Europe/London')


const AdminPanel = ({ snapshotSettings, pointSystem }) => {
    const [snapshotDate, updateSnapshotDate] = useState(null);

    const handleDateChange = (dateChange) => {
        axios.post(api_base + "/api/updateSnapshotDate", {
            newDate: dateChange.toJSON()
        }).then(() => {
            console.log(
                `Snapshot date updated to ${dateChange.toJSON()}! Reload to confirm.`
            );
        });
        updateSnapshotDate(dateChange)
    }

    if (!snapshotDate && !!snapshotSettings[0]) {
        updateSnapshotDate(snapshotSettings[0]['snapshot_date'])
    }

    return <div>
        <h1>Admin Panel</h1>
        {snapshotDate ? <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDateTimePicker
                format="LLL"
                margin="normal"
                id="set-snapshot-date"
                label="Set snapshot date (GMT)" // This is timezone adjusted...
                value={snapshotDate}
                onChange={handleDateChange}
                style={{ minWidth: "290px" }}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
            />
        </MuiPickersUtilsProvider> : null}
        <div style={{ maxWidth: "600px", margin: "50px auto" }}>
        <TableDataGrid
            tabledata={pointSystem}
            tabletitle="Point System"
        />
        </div>
    </div>
}

export default AdminPanel