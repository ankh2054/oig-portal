import React, { useState } from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import updateDb from './update-db'

const useStyles = makeStyles((theme) => ({
    addItemButton: {
        position: 'relative',
        float: 'left',
        left: '10px',
        top: '-45px'
    },
    addItemButtonEmpty: {
        margin: "10px auto"
    }
}))


export default function AddNewDialog({ type, tableState, setTableState }) {
    const classes = useStyles();

    const isProdOrBizdev = type === 'product' || type === 'bizdev';
    const isComm = type === 'community';
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupStage, setPopupStage] = useState(0);
    const [promptValue, setPromptValue] = useState(null)
    const [showPrompt, setShowPrompt] = useState(true);
    const [promptType, setPromptType] = useState('text');

    const defaultPopupData = {
        title: `Add new ${type}`,
        desc: "",
        promptLabel: "",
        promptDefault: "",
        close: "Cancel",
        confirm: "Continue",
    }
    const [popupData, setPopupData] = useState(defaultPopupData);

    const changePrompt = (name, niceName, promptDefault, confirm) => {
        if (!name) {
            setShowPrompt(false)
            setPopupData({
                ...defaultPopupData,
                desc: "Please enter " + niceName + ":",
                confirm: `Add new ${type}`
            })
            return
        }
        setPromptValue(promptDefault);
        setPopupData({
            ...popupData,
            desc: "Please enter " + niceName + ":",
            promptLabel: name,
            promptDefault,
            confirm: confirm ? confirm : 'Continue'
        })
    }

    const changeStage = (stage) => {
        /*if (promptValue) {
          initialPayload[popupData.promptLabel] = promptValue
        }*/
        setPopupStage(stage)
        switch (stage) {
            case 1:
                changePrompt('owner_name', 'guild name', 'sentnlagents')
                break;
            case 2:
                isProdOrBizdev ? changePrompt('name', 'name', `New ${type}`) : changeStage(6)
                break;
            case 3:
                changePrompt('description', 'description', '')
                break;
            case 4:
                changePrompt('stage', 'stage', (type === 'product' ? 'Development' : 'Qualified Lead'))
                break;
            case 5:
                setPromptType('number')
                changePrompt('points', 'points', 0)
                break;
            case 6:
                setPromptType('number')
                isComm ? changePrompt('origcontentpoints', 'origcontentpoints', 0) : changeStage(11)
                break;
            case 7:
                changePrompt('transcontentpoints', 'transcontentpoints', 0)
                break;
            case 8:
                changePrompt('eventpoints', 'eventpoints', 0)
                break;
            case 9:
                changePrompt('managementpoints', 'managementpoints', 0)
                break;
            case 10:
                changePrompt('outstandingpoints', 'outstandingpoints', 0)
                break;
            case 11:
                setPromptType('url')
                isProdOrBizdev ? changePrompt('analytics_url', 'analytics_url', '') : changeStage(14)
                break;
            case 12:
                changePrompt('spec_url', 'spec_url', '')
                break;
            case 13:
                type === 'product' ? changePrompt('code_repo', 'code_repo', '') : changeStage(14)
                break;
            case 14:
                setPromptType('text')
                changePrompt('comments', 'comments (optional)', '', 'Finish');
                break;
            case 15:
                changePrompt(null)
                break;
            case 16:
                setPopupOpen(false)
        }
    }

    const handleClose = () => {
        setPopupOpen(false)
        setPopupData(defaultPopupData)
        setPopupStage(0)
        setShowPrompt(true)
    }

    const handleConfirm = () => {
        changeStage(popupStage + 1)
    }

    const addItem = () => {
        changeStage(1);
        setPopupOpen(true);
    }

    const sanitisePayload = (type, payload) => {
        const {
            owner_name,
            name,
            description,
            stage,
            points,
            origcontentpoints,
            transcontentpoints,
            eventpoints,
            managementpoints,
            outstandingpoints,
            analytics_url,
            spec_url,
            code_repo,
            comments
        } = payload;
        if (type === 'product') {
            return {
                owner_name,
                name,
                description,
                stage,
                points: +points,
                analytics_url,
                spec_url,
                code_repo,
                comments
            }
        }
        if (type === 'bizdev') {
            return {
                owner_name,
                name,
                description,
                stage,
                points: +points,
                analytics_url,
                spec_url,
                comments
            }
        }
        if (type === 'community') {
            return {
                owner_name,
                origcontentpoints: +origcontentpoints,
                transcontentpoints: +transcontentpoints,
                eventpoints: +eventpoints,
                managementpoints: +managementpoints,
                outstandingpoints: +outstandingpoints,
                comments
            }
        }
        return {
            'error': 'Payload not set up'
        }
    }

    /*const addItem = () => {
      const payload = JSON.parse(JSON.stringify(initialPayload))
      // Should ideally be an integrated table editor, when we make it pretty
      // eslint-disable-next-line no-restricted-globals
      const itemConfirm = confirm(`Confirm new ${type}: ${Object.keys(payload).map(key => payload[key]).join(' | ')}`);
      if (itemConfirm) {
        const tableCopy = [...tableState];
        const found = tableCopy.map((row, index) => payload.name && row.name === payload.name && row.owner_name === payload.owner_name ? index : !payload.name && payload.owner_name === row.owner_name ? index : -1).filter(row => { return +row >= 0 });
        console.log(`Data will ${!found[0] ? "not" : null} be overwritten.`);
        const finalPayload = {
          ...payload,
          // This gets overwritten, but no worries - it'll be off by seconds at max.
          date_updated: new Date()
        }
        // This code can be made simpler - .push() wasn't the solution to updating state. See https://stackoverflow.com/a/60957646 - material-table doesn't work with hooks
        if (found[0]) {
          tableCopy[found[0]] = finalPayload;
        } else {
          tableCopy.push(finalPayload)
        }
        setTableState(tableCopy);
        console.log("Table state updated!");
        updateDb(payload, type, tabletitle)
      }
      // Should have an else clause allowing user to edit
    }*/

    return (
        <>
            {type !== 'unknownType' ? <Button
                type="submit"
                variant="contained"
                color="primary"
                className={tableState.length >= 1 ? classes.addItemButton : classes.addItemButtonEmpty}
                onClick={e => addItem(type)}
            >Add new {type}</Button> : null}
            <Dialog
                open={popupOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{popupData.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {popupData.desc}
                    </DialogContentText>
                    {showPrompt ? <TextField
                        autoFocus
                        margin="dense"
                        value={promptValue}
                        onChange={e => setPromptValue(e.target.value)}
                        label={popupData.promptLabel}
                        placeholder={popupData.promptDefault}
                        type={promptType}
                        fullWidth
                    /> : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        {popupData.close}
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        {popupData.confirm}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}