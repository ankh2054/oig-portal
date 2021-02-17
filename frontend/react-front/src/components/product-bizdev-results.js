// Needs a more descriptive name

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
//import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import CodeIcon from '@material-ui/icons/Code';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';


const useStyles = makeStyles((theme) => ({
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  left: {
    marginLeft: 'auto',
  },
}));

const App = ({ data }) => {
  const classes = useStyles();

  const {results, producers} = data;
  
  // Return Guild Logo
  function logo(owner) {
    if (producers) {
      let ownername = producers.find((producer) => producer.owner_name === owner)
      //Conditional rendering if ownername is true, return logosvg.logo_svg
      // Because one of your producers does not have a logo set
      let logosvg_url = ownername ? ownername.logo_svg : ""
      return logosvg_url
    }
    return null
  }

  return (
    <Grid container spacing={4}>
      {results.map((result, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardHeader
              avatar={
                <Link href={`/guilds/${result.owner_name}`}>
                  <Avatar alt={result.owner_name} src={logo(result.owner_name)} />
                </Link>
              }
              /*action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }*/
              title={result.name ? result.name : result.owner_name}
              subheader={!result.name ? null : 'by ' + result.owner_name}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {result.description}
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
                {result.score}
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>

  )

}

export default App