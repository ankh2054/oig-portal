import React, { useState } from 'react';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { api_base } from "../config";
import axios from "axios";

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
        {snapshotDate ? <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDateTimePicker
                format="dd/MM/yyyy @ hh:mm aa"
                margin="normal"
                id="set-snapshot-date"
                label="Set snapshot date (GMT)"
                value={snapshotDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
            />
        </MuiPickersUtilsProvider> : null}
        <p>{JSON.stringify(pointSystem)}</p>
    </div>
}

export default AdminPanel