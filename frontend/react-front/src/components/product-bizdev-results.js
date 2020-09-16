
import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import CodeIcon from '@material-ui/icons/Code';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    left: {
      marginLeft: 'auto',
    },
  }));

const App = ({ results }) => {
    const classes = useStyles();
    return (
    <Grid container spacing={4}>
        {results.map((result) => (
        <Grid item key={result.name} xs={12} sm={6} md={3}>
        <Card  variant="outlined">
          <CardHeader 
            avatar={
              <Avatar alt={result.name} />
            }
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
            title={ result.name }
          />
            <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
             { result.description }
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
                {result.stage}
            <Tooltip title="Code Repo" aria-label="pass" placement="top">
                <IconButton aria-label="share" href={result.code_repo}>
                    <CodeIcon />
                </IconButton>
            </Tooltip>
            <IconButton className={classes.left} >
            { result.score }
            </IconButton>
          </CardActions>
        </Card>
        </Grid>
      ))}
  </Grid>

    )

}

export default App