import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import { api_base } from "../config";
import axios from "axios";
import { Button, TextField } from '@material-ui/core';
import TableDataGrid from './table-datagrid'
import moment from 'moment-timezone'
import MomentUtils from '@date-io/moment'
import Notification from './Notification.js'

moment.tz.setDefault('Europe/London')

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: "500px", margin: "50px auto", textAlign: 'left'
    },
    datePicker: {
        minWidth: "290px"
    },
    techScore: {
        maxWidth: "290px"
    },
    hidden: {
        display: 'none'
    }
}))

const AdminPanel = ({ snapshotSettings, producers, pointSystem, isAdmin, minimumTechScore, metaSnapshotDate, defaultMetaSnapshotDate, formatDate
}) => {
    const classes = useStyles();
    const [snapshotDate, updateSnapshotDate] = useState(null);
    const [passedScore, updatePassedScore] = useState(120)
    const [minTechScore, updateMinTechScore] = useState(minimumTechScore);
    const [currentTable, setCurrentTable] = useState('pointSystem')
    const [toastNotification, setToastNotification] = useState({displayFlag: false, msg: ''})

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

    const handleTechScoreChange = (event) => {
        updateMinTechScore(event.target.value)
    }

    const triggerMetaSnapshot = () => {
        axios.post(api_base + "/api/addMetaSnapshot").then((response) => {
            // alert(response.data)
            setToastNotification({displayFlag: true, msg: "meta-snapshot made."})
        }).catch(err => {
            // alert(err.response.data)
            setToastNotification({displayFlag: true, msg: "meta-snapshot already created today."})
        })
    }

    const handleSaveTechScoreChange = () => {
        axios.post(api_base + "/api/updateAdminSettings", {
            minimum_tech_score: minTechScore
        }).then(() => {
            console.log(
                `Minimum tech score updated to ${minTechScore}! Reload to confirm.`
            );
        });
        updatePassedScore(minTechScore)
    }

    if (!snapshotDate && !!snapshotSettings[0]) {
        updateSnapshotDate(snapshotSettings[0]['snapshot_date'])
    }

    const guildSettings = producers.map(producer => {
        if (Object.keys(producer).length >= 1) {
            return {
                guild_name: producer.owner_name,
                account_name: producer.account_name,
                active: producer.active === true ? "true" : producer.active === false ? "false" : "",
                metasnapshot_date: producer.metasnapshot_date
            }
        } else {
            return null
        }
    })

    const changeView = () => {
        if (currentTable === "pointSystem") {
            setCurrentTable("guildSettings")
        } else {
            setCurrentTable("pointSystem")
        }
    }

    const filterMetaSnapshots = (rows) => {
        if (!!metaSnapshotDate) {
            return rows.filter(row => row.metasnapshot_date && row.metasnapshot_date.substring(0, 10) === metaSnapshotDate.date)
        }
        return rows.filter(row => row.metasnapshot_date === defaultMetaSnapshotDate || row.metasnapshot_date === undefined)

    }

    // const formatDate = (dateString) => {
    //     if(!dateString){
    //         return
    //     } 
    //     const options = { year: "numeric", month: "long", day: "numeric" }
    //     return new Date(dateString).toLocaleDateString(undefined, options)
    // }

    return isAdmin ? <div className={classes.root}>
        <h1>Admin Panel {(metaSnapshotDate && metaSnapshotDate !== 'None') ? <span style={{fontSize: '16px', fontWeight: 'bolder'}}>{formatDate(metaSnapshotDate)} </span>: <span style={{fontSize: '16px', fontWeight: 'bolder'}}>(No Time Machine date chosen)</span>}</h1>
        {minTechScore ? <TextField value={minTechScore} className={classes.techScore} fullWidth="true" onChange={handleTechScoreChange} label="Minimum Tech Score"></TextField> : null }
        <br></br><br></br>
        {minTechScore ? <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSaveTechScoreChange}
            disabled={passedScore === minTechScore}
        >
            Save
        </Button> : null}
        <br></br><br></br>
        <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={triggerMetaSnapshot}
        >
            Trigger Meta Snapshot
        </Button>
        <Notification toastNotification={toastNotification} />
        
        <br></br><br></br>
        {snapshotDate ? <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDateTimePicker
                format="LLL"
                margin="normal"
                id="set-snapshot-date"
                label="Set snapshot date (London)" // This is timezone adjusted...
                value={snapshotDate}
                onChange={handleDateChange}
                className={classes.datePicker}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
            />
        </MuiPickersUtilsProvider> : null}
        <br></br><br></br>
        <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={changeView}
        >
            Edit {currentTable === "pointSystem" ? "Guilds" : "Point System"}
        </Button>
        <br></br><br></br>
        <div className={currentTable === "guildSettings" ? classes.hidden : null}>
            <TableDataGrid
                tableData={filterMetaSnapshots(pointSystem)}
                tableTitle="Point System"
                isAdmin={isAdmin}
                defaultMetaSnapshotDate={defaultMetaSnapshotDate}
            />
        </div>
        <div className={currentTable === "pointSystem" ? classes.hidden : null}>
            <TableDataGrid
                tableData={filterMetaSnapshots(guildSettings)}
                tableTitle="Guild Settings"
                isAdmin={isAdmin}
                defaultMetaSnapshotDate={defaultMetaSnapshotDate}
            />
        </div>
    </div> : null
}

export default AdminPanel