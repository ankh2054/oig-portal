import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from "react-hook-form";
import Grid from '@material-ui/core/Grid';
import axios from 'axios'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { api_base } from '../config'




const useStyles = makeStyles((theme) => ({
    root: {
      maxWidth: 345,
    },
    left: {
      marginLeft: 'auto',
    },
    form:{
      margin: '20px',
    },
    submit:{
      marginBottom: '20px',
    }
  }));


const App = ({ producers }) => { 
  const [open, setOpen] = React.useState(false);
  const [producer, setProducer] = useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //Get current timestamp for form use 
  var d1 = new Date();
  const classes = useStyles();
  const { register, handleSubmit } = useForm();
  const apisubmit = (formdata, e) => {
    axios.post(api_base+'/api/monthlyUpdate', formdata)
    .then(console.log(formdata.owner_name))
    .then(setProducer(formdata.owner_name))
    .catch(error => {
        console.error('There was an error!', error);
    });
    //Reset form values
    e.target.reset();
}

  return (
    <Grid container justify="center" >
    <Grid item xs={6}>
    <Paper  elevation={3}>
      <h1>Submit Monthly Update</h1>
      <form className={classes.form} onSubmit={handleSubmit(apisubmit)}>
          <Autocomplete
          freeSolo
          options={producers.map((option) => option.owner_name)}
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Guild Name"
              id="owner_name"
              name="owner_name"
              required
              inputRef={register}
              margin="normal"
              variant="outlined"
              InputProps={{ ...params.InputProps, type: 'search' }}
            />
            )}
          />
          <TextField
            variant="outlined"
            margin="normal"
            inputRef={register}
            required={true}
            isRequired="true"
            fullWidth
            multiline
            rows={5}
            id="tech_ops"
            label="Tech Ops update"
            name="tech_ops"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            inputRef={register}
            required
            fullWidth
            multiline
            rows={5}
            id="product"
            label="Product update"
            name="product"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            inputRef={register}
            required
            fullWidth
            multiline
            rows={5}
            id="bizdev"
            label="Business Development update"
            name="bizdev"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            inputRef={register}
            required
            fullWidth
            multiline
            rows={5}
            id="community"
            label="Community update"
            name="community"
            autoFocus
          />
           <Grid item xs={4}  justify="center" >
          <Button
            type="submit"
            fullWidth
            large
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleClickOpen}
          >
            Submit
          </Button>
          </Grid>
          <input name="date_update" type="hidden" defaultValue={d1.toUTCString()} ref={register({ required: true })} />
        </form>
    </Paper>
    </Grid>
    <Dialog
        open={open}
        onClose={handleClose}
        producer={producer}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
      <DialogTitle id="alert-dialog-title">{'Monthly Update'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Thank you <b>{producer}</b> your monthly update has been submitted
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Great
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )

}

export default App
