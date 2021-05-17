import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import { green, red } from '@material-ui/core/colors'
// Ununused var // import HttpsIcon from '@material-ui/icons/Https'
// import MoreVertIcon from '@material-ui/icons/MoreVert'
import Grid from '@material-ui/core/Grid'
// Ununused var // import FavoriteIcon from '@material-ui/icons/Favorite'
import Tooltip from '@material-ui/core/Tooltip'
import datec from '../functions/date'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import clsx from 'clsx'
import Collapse from '@material-ui/core/Collapse'
import TableDataGrid from './table-datagrid'

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
  cardHeader: {
    '& span': {
      // half the page, minus half the link width, minus half the icon size, minus half the icon right margin size
      marginLeft: 'calc(50% - 75px - 20px - 8px)',
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
}));

const reArrangeTableHeaders = (item) => {
  // JSON.stringify trick needed to properly exclude name for community & tech updates
  return JSON.parse(JSON.stringify({
    guild: item.guild ? item.guild : undefined,
    name: item.name ? item.name : undefined,
    comments: item.comments,
    score: item.score,
    ...item
  }))
}

const SnapshotScoring = ({ results, producers, products, bizdevs, community, isAdmin, pointSystem }) => {
  const classes = useStyles();
  const [expandedId, setExpandedId] = useState(false);

  /** Filters items (products, bizdev, community) by owner */
  function filterByOwner(items, owner) {
    const filteredItems = items.filter((presult) => presult.owner_name === owner);
    // Any manipulations of initially loaded data can be done here
    if (filteredItems.length >= 1) {
      // Place comments second to front for product & bizdev, front for community
      return filteredItems.map((item) => reArrangeTableHeaders(item))
    }
    return filteredItems
  }

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
    for (const scoring of statearray) {
      count += parseFloat(scoring.score)
    }
    return count
  }

  // Counts all scores together
  function totalscore(tech, product, bizdev, community) {
    // Set passing score
    let pass = 150
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

  return (
    <Grid container spacing={4}>
      {results.map((result) => {
        const filteredProducts = filterByOwner(products, result.owner_name, 'product');
        const filteredBizdevs = filterByOwner(bizdevs, result.owner_name, 'bizdev');
        const filteredCommunity = filterByOwner(community, result.owner_name, 'community')
        // Another 'achievement' multiplier exists.
        return (
          <Grid item key={result.owner_name} xs={12} sm={12} md={12}>
            <Card className={classes.root} variant="outlined">
              <Link to={`/guilds/${result.owner_name}`} className={classes.link}>
                <CardHeader
                  avatar={
                    <Avatar alt={result.owner_name} src={logo(result.owner_name)} className={classes.large} />
                  }
                  /*action={
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  }*/
                  title={result.owner_name}
                  subheader={datec(result.date_check)}
                  className={classes.cardHeader}
                />
              </Link>
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Tech: </b>{parseInt(result.score)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Products: </b>{statescore(result.owner_name, products)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Bizdev: </b>{statescore(result.owner_name, bizdevs)}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  <b>Community: </b>{statescore(result.owner_name, community)}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton className={classes.left} >
                  {totalscore(result.score, statescore(result.owner_name, products), statescore(result.owner_name, bizdevs), statescore(result.owner_name, community))}
                </IconButton>
                <IconButton
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: expandedId,
                  })}
                  onClick={() => setExpandedId(expandedId !== result.owner_name ? result.owner_name : "")}
                  aria-expanded={expandedId === result.owner_name ? true : false}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </IconButton>
              </CardActions>
              <Collapse in={expandedId === result.owner_name ? true : false} timeout="auto" unmountOnExit>
                <CardContent>
                  <TableDataGrid
                    tableData={filteredProducts}
                    tableTitle="Products"
                    defaultGuild={result.owner_name}
                    isAdmin={isAdmin}
                    pointSystem={pointSystem}
                  />
                </CardContent>
                <CardContent>
                  <TableDataGrid
                    tableData={filteredBizdevs}
                    tableTitle="Bizdevs"
                    defaultGuild={result.owner_name}
                    isAdmin={isAdmin}
                  />
                </CardContent>
                <CardContent>
                  <TableDataGrid
                    tableData={filteredCommunity}
                    tableTitle="Community"
                    defaultGuild={result.owner_name}
                    isAdmin={isAdmin}
                  />
                </CardContent>
                <CardContent>
                  <TableDataGrid
                    tableData={[reArrangeTableHeaders(result)]}
                    tableTitle="Tech Snapshot"
                    isAdmin={isAdmin}
                  />
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  );
}

export { SnapshotScoring, reArrangeTableHeaders }