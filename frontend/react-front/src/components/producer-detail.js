import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
import ProdBizdev from './product-bizdev-results'
import Button from '@material-ui/core/Button';

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
}));

const App = ({ results ,products, bizdevs }) => {
  const classes = useStyles();
    return (
      <div>
        <h1></h1>
        <ProdBizdev
          results={ products }
        />
        <ProdBizdev
          results={ bizdevs }
        />
        <h1></h1>
        <TechresultTables
              results={ results }
              description="Wax Mainnet"
         />
         <Link to={`/`}>
          <Button variant="contained" color="primary" >
            Back
          </Button>
         </Link>
      </div>
    )
  
  }
  export default App


