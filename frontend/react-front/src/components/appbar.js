import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
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
  const [guildname, setGuildname] = useState([]);
  const classes = useStyles();
  

  return (
    <div className={classes.root}>
      <AppBar  className={classes.menuwax}>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Icon style={{ fontSize: 80 }} classes={{root: classes.iconRoot}}>
            
            <WAXsvg style={{ fontSize: 90 }} className={classes.logosvg} />
          </Icon>
          <Typography fontWeight="fontWeightBold" variant="h4" className={classes.title} color='default'>
          WAX - OIG Portal
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}