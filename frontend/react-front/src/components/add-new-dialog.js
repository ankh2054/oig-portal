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

// TODO: calculate score for new entries

const useStyles = makeStyles((theme) => ({
    addItemButton: {
        position: 'relative',
        float: 'left',
        left: '10px',
        top: '-45px'
    },
    addItemButtonEmpty: {
        margin: "10px auto 50px"
    }
}))


export default function AddNewDialog({ type, tableState, setTableState, defaultGuild, isAdmin }) {
    const classes = useStyles();

    const isProdOrBizdev = type === 'product' || type === 'bizdev';
    const isComm = type === 'community';
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupStage, setPopupStage] = useState(0);
    const [promptValue, setPromptValue] = useState(null)
    const [showPrompt, setShowPrompt] = useState(true);
    const [promptType, setPromptType] = useState('text');
    const [promptAnswers, setPromptAnswers] = useState({})

    const defaultPopupData = {
        title: `${isComm ? "Update community points" : `Add new ${type}`}`,
        desc: "",
        promptLabel: "",
        promptDefault: "",
        close: "Cancel",
        confirm: "Continue",
    }
    const [popupData, setPopupData] = useState(defaultPopupData);

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
        if (isComm) {
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

    const processNewItem = (initialPayload) => {
        let payload = JSON.parse(JSON.stringify(initialPayload))
        // Should ideally be an integrated table editor, when we make it pretty
        payload.date_updated = new Date()
        // TODO: Update table state
        updateDb('update', type, payload)
        handleClose()
    }

    const submitNewItem = () => {
        const sanitisedPayload = sanitisePayload(type, promptAnswers);
        if (sanitisedPayload.error) {
            alert(sanitisedPayload.error)
            return
        }
        let errors = [];
        if (!sanitisedPayload.owner_name) {
            errors.push("owner_name")
        }
        if ((type === 'product' || type === 'bizdev') && !sanitisedPayload.name) {
            errors.push("name")
        }
        if (errors.length !== 0) {
            alert(`${type} could not be added: missing ${errors.join(", ")}.`)
            return
        }
        processNewItem(sanitisedPayload)
    }

    const changePrompt = (name, niceName, promptDefault, confirm) => {
        if (!niceName) {
            setShowPrompt(false)
            console.log(promptAnswers)
            const confirmation = <ul>{Object.keys(promptAnswers).map(answer => <li key={answer}><strong>{answer}:</strong> {promptAnswers[answer]}</li>)}</ul>
            setPopupData({
                ...defaultPopupData,
                desc: `Please confirm the following ${type} details:`,
                confirmation,
                confirm: `${isComm ? "Confirm community update" : `Confirm new ${type}`}`
            })
            return
        }
        if (!name) {
            setShowPrompt(false)
            setPopupData({
                ...defaultPopupData,
                desc: "Please enter " + niceName + ":",
                confirm: `${isComm ? "Add/update community points" : `Add new ${type}`}`
            })
            return
        }
        setPromptValue(promptDefault);
        setShowPrompt(true)
        setPopupData({
            ...popupData,
            desc: "Please enter " + niceName + ":",
            promptLabel: name,
            promptDefault,
            confirm: confirm ? confirm : 'Continue'
        })
    }

    const changeStage = (stage) => {
        if (promptValue && popupData.promptLabel === 'name') {
            const tableCopy = tableState;
            const found = tableCopy.map((row, index) => row.name === promptValue && row.owner_name === promptAnswers.owner_name ? index : -1).filter(row => { return +row >= 0 });
            const checkName = found[0] !== undefined ? `${promptValue} ${(found.length)}` : promptValue
            let promptAnswerPatch = {
                name: checkName
            };
            setPromptAnswers({
                ...promptAnswers,
                ...promptAnswerPatch

            })
        } else if (promptValue) {
            let promptAnswerPatch = {};
            promptAnswerPatch[popupData.promptLabel] = promptValue;
            setPromptAnswers({
                ...promptAnswers,
                ...promptAnswerPatch

            })
        }
        setPopupStage(stage)
        switch (stage) {
            case 1:
                const lastGuild = tableState.length >= 1 ? tableState[tableState.length - 1].owner_name : defaultGuild ? defaultGuild : null;
                changePrompt('owner_name', 'guild name', lastGuild)
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
                type === 'product' ? changePrompt('analytics_url', 'analytics_url', '') : changeStage(14)
                break;
            case 12:
                changePrompt('spec_url', 'spec_url', '')
                break;
            case 13:
                changePrompt('code_repo', 'code_repo', '')
                break;
            case 14:
                setPromptType('text')
                changePrompt('comments', 'comments (optional)', '', 'Finish');
                break;
            case 15:
                changePrompt(null)
                break;
            case 16:
                submitNewItem()
                break;
            default:
                break;
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

    return (
        <>
            {type !== 'unknownType' && isAdmin ? <Button
                type="submit"
                variant="contained"
                color="primary"
                className={tableState.length >= 1 ? classes.addItemButton : classes.addItemButtonEmpty}
                onClick={e => addItem(type)}
            >{isComm ? "Add/update community points" : `Add new ${type}`}</Button> : null}
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
                        {popupData.confirmation ? <span>{popupData.confirmation}</span> : null}
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