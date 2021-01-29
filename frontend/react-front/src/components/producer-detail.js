import React, { useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
// Ununused var // import { makeStyles } from '@material-ui/core/styles';
import TechresultTables from './tech-tablelist-results'
import ProdBizdev from './product-bizdev-results'
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

const App = ({ producer, results, products, bizdevs }) => {
  // Ununused var // const classes = useStyles();
  const [waxJSON, setWaxJSON] = useState(null)
  const [countryCode, setCountryCode] = useState(null)
  
  if (producer && waxJSON === null) {
    setWaxJSON({})
    axios.get(producer.jsonurl).then(response => response.data).then(data => setWaxJSON(data))
  }

  /* Use https://emoji-css.afeld.me/ or a custom map of country codes to flags? */
  /*if (!countryCode && waxJSON !== null && waxJSON.org && waxJSON.org.location && waxJSON.org.location.country) {
    setCountryCode(waxJSON.org.location.country)
  }*/

  return (
    <div>
      {/* Loads slowly for now - find more efficient solution */}
      {/* producer ? <img alt={producer.candidate + " logo"} src={producer.logo_svg}/> : null */}
      {producer ? <h1>{producer.owner_name} <small>{producer.candidate}</small></h1> : null}
      <ProdBizdev
        results={ products }
      />
      <ProdBizdev
        results={ bizdevs }
      />
      {/* // Ununused // <h1></h1> */}
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


