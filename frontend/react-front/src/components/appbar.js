import React  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

//import BOMsvg from '../assets/img/bomlogo'
//<BOMsvg style={{ fontSize: 50 }} className={classes.bomsvg} />

import WAXsvg from '../assets/img/logo-wax'

//import coreLogo from '../assets/img/logo.svg'
//<img alt="mainlogo" className={classes.imageIcon} src={coreLogo}/>

import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  title: {
    flexGrow: 1,
    padding: '0 30px'
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
    padding: '0 20px',
  },
  imageIcon: { height: '100%' },
  iconRoot: { textAlign: 'center', padding: '0 30px', marginLeft: '-40px' },
}));



export default function ButtonAppBar() {
  const classes = useStyles();

  
  return (
    <>
    <AppBar  position="fixed" className={classes.menuwax}>
    <Toolbar>
      <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon />
      </IconButton>
      <Link  href="/" className={classes.link}>
      <Icon style={{ fontSize: 140 }} classes={{root: classes.iconRoot}}>
        <WAXsvg style={{ fontSize: 140 }} className={classes.logosvg} />
      </Icon>
      </Link>
      <Typography fontWeight="fontWeightBold" variant="h4" className={classes.title} color='inherit'>
       OIG Portal
      </Typography>
        <nav>
            <Link underline="none" variant="button" color="inherit" href="/" className={classes.link}>
              Home
            </Link>
            <Link underline="none" variant="button" color="inherit" href="/latestresults" className={classes.link}>
              Latest Results
            </Link>
            <Link underline="none" variant="button" color="inherit" href="/snapshot" className={classes.link}>
              Scores
            </Link>
            <Link underline="none" variant="button" color="inherit" href="/form" className={classes.link}>
              Submit Update
            </Link>
            <Link variant="button" color="inherit" href="/admin" className={classes.link}>
              Admin
            </Link>
      </nav>
    </Toolbar>
  </AppBar>
  {/* To prefent items from going missing */}
    <Toolbar />
    <Toolbar />
    <Toolbar />
  </>
  );
}