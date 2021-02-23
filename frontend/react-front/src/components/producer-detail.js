import React from 'react';
import { Link } from 'react-router-dom';
// Ununused var // import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
import Button from '@material-ui/core/Button';

// Ununused var // 
/* const useStyles = makeStyles((theme) => ({
  root: {
    
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  left: {
    marginLeft: 'auto',
  },
})); */

const App = ({ results ,products, bizdevs }) => {
  // Ununused var // const classes = useStyles();
    return (
      <div>
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


