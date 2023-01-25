import React, {useMemo} from 'react';
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
import FavoriteIcon from '@material-ui/icons/Favorite';
import Tooltip from '@material-ui/core/Tooltip';
import datec from '../functions/date';
import getCachedImage from './getCachedImage';
import { Masonry } from "masonic";
const useStyles = makeStyles((theme) => ({
  root: {
  },
  retired: {
    opacity: 0.7,
    '& *': {
      filter: 'grayscale(1)'
    }
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
  cardHeader: {
    '& > *': {
      margin: 0
    },
    '& span': {
      marginLeft: 'calc(100% - 150px)',
      width: '150px',
      fontWeight: 'bold',
      '&:first-child': {
        color: '#332b1f',
        fontSize: '1rem',
        padding: '10px 20px',
        marginBottom: '5px',
        borderRadius: '80px',
        background: 'linear-gradient(90.08deg, rgb(247, 142, 30), rgb(255, 220, 81) 236.03%)',
        '&:hover': {
          background: 'linear-gradient(275.91deg, rgb(247, 142, 30) 8.43%, rgb(255, 220, 81) 174.56%)'
        },
      }
    },
  },
  link: {
    textDecoration: 'none',
  },
  summary: {
    '& > *': {
      textAlign: 'left',
      fontSize: '1rem'
    }
  }
}));

const App = ({ results, producers, products, bizdevs, community, producerLogos, producerDomainMap, minimumTechScore }) => {
  const classes = useStyles();

  // Return Guild Logo
  function logo(owner) {
    let ownername = producers.find((producer) => producer.owner_name === owner)
    //Conditional rendering if ownername is true, return logosvg.logo_svg
    // Because one of your producers does not have a logo set
    let logosvg_url = ownername ? ownername.logo_svg : ""
    return getCachedImage(logosvg_url, producerLogos, producerDomainMap)
  }

  // Returns score from state
  function statescore(owner, state) {
    // Get array from state where owner = owner_name
    let statearray = state.filter((product) => product.owner_name === owner)
    let count = 0
    // Loop over each array getting and adding the scores together
    for (const scoring of statearray) {
      count += parseFloat(scoring.score)
    }
    return count
  }

  // Counts all scores together
  function totalscore(tech, product, bizdev, community) {
    // Set passing score
    let pass = minimumTechScore
    let sum = parseInt(tech) + product + bizdev + community
    if (sum >= pass) {
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
    if (result === 'TLSv1.3' || result === 'TLSv1.2') {
      return (
          <Tooltip title={"TLS " + result.slice(4, 7)} aria-label={result.slice(4, 7)} placement="top">
            <IconButton>
              <HttpsIcon /* Smart use of `style` */ style={{color: green[500]}}/>
            </IconButton>
          </Tooltip>


      );
    }
    if (result == null) {
      return (
          <Tooltip title={"TLS " + result.slice(4, 7)} aria-label={result.slice(4, 7)} placement="top">
            <IconButton>
              <HttpsIcon /* Smart use of `style` */ style={{color: green[500]}}/>
            </IconButton>
          </Tooltip>

      );
    } else {
      return (
          <Tooltip title={"TLS " + result.slice(4, 7)} aria-label={result.slice(4, 7)} placement="top">
            <IconButton>
              <HttpsIcon /* Smart use of `style` */ style={{color: red[500]}}/>
            </IconButton>
          </Tooltip>
      );
    }
  }

  // Return Top21 boolean
  const top21 = (owner) =>  {
    const ownername = producers.find(producer => producer.owner_name === owner);
    // Conditional rendering because if false it becomes undefined
    let top21bol = ownername ? ownername.top21 : false
    return (
        <>
          {top21bol
              // Font-awesome icons
              //  ? <Avatar className={classes.green}>BP</Avatar>
              //  : <Avatar className={classes.red}>SB</Avatar>
              ? <Tooltip title="top21" aria-label="top21" placement="top">
                <IconButton>
                  <FavoriteIcon /* Smart use of `style` */ style={{color: green[500]}}/>
                </IconButton>
              </Tooltip>
              : <Tooltip title="standby" aria-label="standby" placement="top">
                <IconButton>
                  <FavoriteIcon /* Smart use of `style` */ style={{color: red[500]}}/>
                </IconButton>
              </Tooltip>
          }
        </>
    );
  }

  const isActive = (owner_name) => {
    const owner = producers.find(producer => producer.owner_name === owner_name)
    return owner ? (owner.active !== false && owner.active !== null) : true;
  }


  const ResultCard = ({ data}) => {

    return useMemo(()=> {
      return  isActive(data.owner_name) === true ? (
          /* ACTIVE */
          <div  key={data.owner_name}>
            <Card className={classes.root} variant="outlined">
              <Link className={classes.link} to={`/guilds/${data.owner_name}`}>
                <CardHeader
                    avatar={
                      <Avatar alt={data.owner_name} src={logo(data.owner_name)} className={classes.large}/>
                    }
                    /*action={
                      <IconButton aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    }*/
                    title={data.owner_name}
                    subheader={datec(data.date_check)}
                    className={classes.cardHeader}
                />
              </Link>
              <CardContent className={classes.summary}>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Tech: </b>{parseInt(data.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Products: </b>{statescore(data.owner_name, products)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Bizdev: </b>{statescore(data.owner_name, bizdevs)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Community: </b>{statescore(data.owner_name, community)}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                {top21(data.owner_name)}
                <IconButton aria-label="share">
                  {textResult(data.tls_check)}
                </IconButton>
                <IconButton className={classes.left}>
                  {totalscore(data.score, statescore(data.owner_name, products), statescore(data.owner_name, bizdevs), statescore(data.owner_name, community))}
                </IconButton>
              </CardActions>
            </Card>
          </div>
      ) : (
          /* INACTIVE */
          <div key={data.owner_name}>
            <Card className={[classes.root, classes.retired]} variant="outlined">
              <Link className={classes.link} to={`/guilds/${data.owner_name}`}>
                <CardHeader
                    avatar={
                      <Avatar alt={data.owner_name} src={logo(data.owner_name)} className={classes.large}/>
                    }
                    title={data.owner_name}
                    subheader={datec(data.date_check)}
                    className={classes.cardHeader}
                />
              </Link>
              <CardContent className={classes.summary}>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Tech: </b>{parseInt(data.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Products: </b>{statescore(data.owner_name, products)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Bizdev: </b>{statescore(data.owner_name, bizdevs)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Community: </b>{statescore(data.owner_name, community)}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                {top21(data.owner_name)}
                <IconButton aria-label="share">
                  {textResult(data.tls_check)}
                </IconButton>
                <IconButton className={classes.left}>
                  {totalscore(data.score, statescore(data.owner_name, products), statescore(data.owner_name, bizdevs), statescore(data.owner_name, community))}
                </IconButton>
              </CardActions>
            </Card>
          </div>);
    }, [data])

  };

  return (
        <Masonry items={results} render={ResultCard} columnWidth={370} columnGutter={32} maxColumnCount={4} overscanBy={1} itemHeightEstimate={315}/>
  );
}
export default App;
