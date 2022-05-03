import React from 'react'
import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Typography from "@material-ui/core/Typography";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import WAXsvg from "../../assets/img/logo-wax";
import Icon from "@material-ui/core/Icon";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Avatar, Divider } from '@mui/material';
import Scrollbar from '../Scrollbar';
import NavbarIllustration from '../NavbarDocs';

import {
  BrowserRouter as Router,
  Link
} from "react-router-dom";
import { maxWidth } from '@mui/system';


const useStyles = makeStyles((theme) => ({
  navContainer: { 
    paddingTop: '5rem', 
    position: 'fixed', 
    top: '0px', 
    bottom: '0px', 
    width: '250px',
    
  },
  navList: {
    padding: 0, 
    minHeight: '250px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    listStyle: 'none',
    maxWidth: '250px',
    padding: '0 1rem'
  },
  link: {
    display: 'flex',
    padding: '13px 15px',
    borderRadius: '15px',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    color: '#212B36',
    '&:hover': {
      border: 'none',
      backgroundColor: 'rgba(145, 158, 171, 0.12)',
      cursor: 'pointer',
      color: '#637381',
      fontWeight: '700'
    },
  },
  icon: {
    fontSize: '18px',
    color: 'inherit',
    marginRight: '5px'
     
  }
  
}));

const Sidebar = ({activeUser='', loginModal, logOut}) => {
  const classes = useStyles();
  const { dispatch } = useContext(DarkModeContext);
  
  return (
    <Scrollbar className={classes.navContainer}> 
      <div style={{padding: '1rem 1rem', borderRadius: '15px'}}>
        <div style={{display: 'flex'}}>
          <Link to='/' style={{textDecoration: 'none', display: 'flex', color: 'inherit'}}>
            <WAXsvg style={{backgroundColor: 'black', width: "110px", height: "100%", marginRight: '7px' }}/>
          <Typography style={{fontSize: '20px', fontWeight: '600', textDecoration: 'none'}}>
            OIG Portal 
          </Typography>
          </Link>
        </div>
      </div>
      <div style={{padding: '1rem 0.5rem', margin: '2rem 1rem', border: 'none', borderRadius: '15px', color: 'black', backgroundColor: 'rgba(145, 158, 171, 0.12)'}}>
        <Box to="/" style={{display: 'flex', justifyContent: 'flex-start'}}>
          <Avatar src={''} style={{marginRight: '15px'}}/>
          <Box>
            <Typography style={{fontSize: '14px', fontWeight: '600', display: 'flex'}}>
              Admin
              <span style={{marginLeft: '15px'}}>
                <Typography style={{fontSize: '14px', color: 'green'}}>
                  {activeUser ? '( Online )' : 'Not Logged in'}
                </Typography>
            </span>
            </Typography>
            
            <Typography style={{fontSize: '14px', color: 'green', fontWeight: '600'}}>
              {activeUser ? activeUser.accountName : '' }
            </Typography>
          </Box>
        </Box>
      </div>
      <Divider style={{marginBottom: '2rem'}}/>
      <ul className={classes.navList}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <li className={classes.link}>
          <DashboardIcon className={classes.icon}/>
          <span>Home</span>
        </li>
        </Link>
        <Link to="/home" style={{ textDecoration: "none" }}>
        <li className={classes.link}>
          <DashboardIcon className={classes.icon}/>
          <span>Guild Results</span>
        </li>
        </Link>
        <Link to="/latestresults" style={{ textDecoration: "none" }}>
          <li className={classes.link}>
            <PersonOutlineIcon className={classes.icon}/>
            <span>Latest Results</span>
          </li>
        </Link>
        <Link to="/snapshot" style={{ textDecoration: "none" }}>
          <li className={classes.link}>
            <StoreIcon className={classes.icon} />
            <span>Scores</span>
          </li>
        </Link>
        <Link to="/admin" style={{ textDecoration: "none" }}>
          <li className={classes.link}>
            <CreditCardIcon className={classes.icon} />
            <span>Admin</span>
          </li>
        </Link>
        <li className={classes.link}>
          <ExitToAppIcon className={classes.icon} />
          <span onClick={activeUser ? logOut : loginModal}>{activeUser ? "Log out " + activeUser.accountName : "Log In"}</span>
        </li>
      </ul>
      <NavbarIllustration /> 
   </Scrollbar>
  );
};

export default Sidebar;
