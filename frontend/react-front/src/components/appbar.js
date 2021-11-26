import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import Link from '@material-ui/core/Link';
import {Link} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
//import IconButton from '@material-ui/core/IconButton';
//import MenuIcon from '@material-ui/icons/Menu';

//import BOMsvg from '../assets/img/bomlogo'
//<BOMsvg style={{ fontSize: 50 }} className={classes.bomsvg} />

import WAXsvg from '../assets/img/logo-wax'

//import coreLogo from '../assets/img/logo.svg'
//<img alt="mainlogo" className={classes.imageIcon} src={coreLogo}/>

import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  linkContainer: {
    position: 'absolute',
    right: '0',
    [theme.breakpoints.down("sm")]: {
      right: '-25px'
    }
  },
  link: {
    fontSize: '0.875rem',
    fontFamily:  '"Helvetica", "Roboto", "Arial", sans-serif',
    fontWeight: '500',
    lineHeight: '1.75',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    color: 'white',
    textDecoration: 'none',
    margin: '12px'
  },
  title: {
    position: 'absolute',
    flexGrow: 1,
    padding: 0,
    marginLeft: '90px',
    [theme.breakpoints.down("sm")]: {
      display: 'none'
    },
  },
  menuwax: {
    //background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    background: '#000000',
    border: 0,
    borderRadius: 3,
    //color: 'white',
    padding: '0 30px',
  },
  logosvg: {
    width: '60%',
    height: '100%'
  },
  imageIcon: { height: '100%' },
  iconRoot: {
    textAlign: 'center',
    width: '202px',
    height: '72px',
    position: 'absolute',
    left: '-50px',
    top: '-5px',
    [theme.breakpoints.down("xs")]: {
      left: '-60px',
      top: '-10px',
    },
  },
  toolbar: {
    marginBottom: '40px'
  },
  waxButton: {
    fontSize: '1rem',
    color: '#332b1f',
    borderRadius: '100px',
    fontWeight: 'bold',
    padding: '15px 20px',
    textDecoration: 'none',
    marginRight: '5px',
    background: 'linear-gradient(90.08deg, rgb(247, 142, 30), rgb(255, 220, 81) 236.03%)',
    '&:hover': {
      textDecoration: 'none',
      background: 'linear-gradient(275.91deg, rgb(247, 142, 30) 8.43%, rgb(255, 220, 81) 174.56%)'
    }
  },
}));



export default function ButtonAppBar({ activeUser, loginModal, logOut, isAdmin, metaSnapshotDate, openTimeMachine, setMetaSnapshotDate }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="fixed" className={classes.menuwax}>
        <Toolbar>
          {/*<IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
  </IconButton>*/}
          <Link href="/" className={classes.link}>
            <Icon classes={{ root: classes.iconRoot }}>
              <WAXsvg className={classes.logosvg} />
            </Icon>
          </Link>
          <Typography fontWeight="fontWeightBold" variant="h4" className={classes.title} color='inherit'>
            OIG Portal
          </Typography>
          <nav className={classes.linkContainer}>
            {metaSnapshotDate && (<Link variant="button" color="inherit" to="#" onClick={() => setMetaSnapshotDate(null)} className={classes.waxButton}>
              None
            </Link>)}
            <Link variant="button" color="inherit" to="#" onClick={openTimeMachine} className={classes.waxButton}>
              {metaSnapshotDate ? metaSnapshotDate.short : "Time Machine"}
            </Link>
            <Link color="inherit" to="/" className={classes.link}>
              Home
            </Link>
            <Link to="/latestresults" className={classes.link}>
              Latest Results
            </Link>
            <Link to="/snapshot" className={classes.link}>
              Scores
            </Link>
            {isAdmin ?
              <Link to="/form" className={classes.link}>
                Submit Update
              </Link> : null}
            {isAdmin ?
              <Link to="/admin" className={classes.link}>
                Admin
              </Link> : null}
            {activeUser ?
              <Link to={`/guilds/${activeUser.accountName}`} className={classes.link}>
                Profile
              </Link> : null}
            <Link  to="#" onClick={activeUser ? logOut : loginModal} className={classes.waxButton}>
              {activeUser ? "Log out " + activeUser.accountName : "Log In"}
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      {/* To prefent items from going missing */}
      <Toolbar className={classes.toolbar} />
      {/*<Toolbar />
      <Toolbar />*/}
    </>
  );
}