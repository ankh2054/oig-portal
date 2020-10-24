import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { green, red } from '@material-ui/core/colors';
import HttpsIcon from '@material-ui/icons/Https';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Tooltip from '@material-ui/core/Tooltip';
import datec from '../functions/date'

const useStyles = makeStyles((theme) => ({
  root: {
    
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  left: {
    marginLeft: 'auto',
  },
  red: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  green: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
}));



const App = ({ results, producers, products, bizdevs, community }) => {
  const classes = useStyles();
  // Return Guild Logo
  function logo(owner) {
    let ownername = producers.find((producer) => producer.owner_name === owner)
    //Conditional rendering if ownername is true, return logosvg.logo_svg
    // Because one of your producers does not have a logo set
    let logosvg_url = ownername ? ownername.logo_svg : ""
    return logosvg_url
  }
  
  // Returns score from state 
  function statescore(owner, state) {
      // Get array from state where owner = owner_name
      let statearray = state.filter((product) => product.owner_name === owner)
      let count = 0
      // Loop over each array getting and adding the scores together
      for (const scoring of statearray ) {
        count += parseFloat(scoring.score)
      }
      return count
  }

 // Counts all scores together
  function totalscore(tech,product,bizdev,community){
      // Set passing score
      let pass = 150
      let sum = parseInt(tech)+product+bizdev+community
      if (sum >= pass ) {
        return (
            <Tooltip title="pass" aria-label="pass" placement="top">
                <Avatar className={classes.green}>{parseInt(sum)}</Avatar>
            </Tooltip>
        );
      } else {
        return (
            <Tooltip title="fail" aria-label="fail" placement="top">
                <Avatar className={classes.red}>{parseInt(sum)}</Avatar>
            </Tooltip>
            
        );
      }

  }

  const textResult = (result) => {
    if (result === 'TLSv1.3' || result === 'TLSv1.2' ) {
      return (
        <Tooltip title={"TLS "+result.slice(4,7)} aria-label={result.slice(4,7)} placement="top">
          <IconButton>
            <HttpsIcon style={{ color: green[500] }} />
          </IconButton>
        </Tooltip>
   

      );
    }if (result == null) {
      return (
      <Tooltip title={"TLS "+result.slice(4,7)} aria-label={result.slice(4,7)} placement="top">
        <IconButton>
          <HttpsIcon style={{ color: green[500] }} />
        </IconButton>
      </Tooltip>

      );
    } else {
      return (
      <Tooltip title={"TLS "+result.slice(4,7)} aria-label={result.slice(4,7)} placement="top">
        <IconButton>
          <HttpsIcon style={{ color: red[500] }} />
        </IconButton>
      </Tooltip>
      );
    }
}

  // Return Top21 boolean
  const top21 = (owner) => {
    var ownername = producers.find(producer => producer.owner_name === owner )
    // Conditional rendering because if false it becomes undefined
    let top21bol = ownername ? ownername.top21 : false
    return(
        <>
          {top21bol
          // Font-awesome icons
          //  ? <Avatar className={classes.green}>BP</Avatar>
          //  : <Avatar className={classes.red}>SB</Avatar>
              ?<Tooltip title="top21" aria-label="top21" placement="top">
                    <IconButton>
                        <FavoriteIcon style={{ color: green[500] }} />
                    </IconButton>
               </Tooltip>
              :<Tooltip title="standby" aria-label="standby" placement="top">
                    <IconButton>
                        <FavoriteIcon style={{ color: red[500] }} />
                    </IconButton>
               </Tooltip>
          }
        </>
      );
  }


  return (
    <Grid container spacing={4}>
    {results.map((result) => (
    <Grid item key={result.owner_name} xs={12} sm={6} md={3}>
    <Card className={classes.root} variant="outlined">
    <Link  to={`/guilds/${result.owner_name}`}>
      <CardHeader 
        avatar={
          <Avatar alt={result.owner_name} src={logo( result.owner_name )} className={classes.large} />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={ result.owner_name }
        subheader={ datec(result.date_check) }
      />
    </Link>
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
            <b>Tech: </b>{parseInt(result.score)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
            <b>Products: </b>{statescore(result.owner_name,products)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
            <b>Bizdev: </b>{statescore(result.owner_name,bizdevs)}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
            <b>Community: </b>{statescore(result.owner_name,community)}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
            {top21(result.owner_name)}
        <IconButton aria-label="share">
            {textResult(result.tls_check)}
        </IconButton>
        <IconButton className={classes.left} >
            {totalscore(result.score,statescore(result.owner_name,products),statescore(result.owner_name,bizdevs),statescore(result.owner_name,community))}
        </IconButton>
      </CardActions>
    </Card>
    </Grid>
   ))}
   </Grid>
  );
}

export default App