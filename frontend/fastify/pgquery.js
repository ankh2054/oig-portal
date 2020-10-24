// Load env variables from the config.js
const { pguser, pgport, pgpassword, pgdb, pghost } = require('./config');

const { Client } = require('pg');

const client = new Client ({
    user: pguser,
    password: pgpassword,
    host: pghost,
    database: pgdb,
    port: pgport
})

client.connect()

// Get all producers
const getProducers = (request, reply) => {
    client.query('SELECT * FROM oig.producer WHERE active ORDER BY owner_name ASC', (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }

// Get all results
const getResults = (request, reply) => {
    client.query('SELECT * FROM oig.results ORDER BY date_check DESC', (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }

// Get all products
const getProducts = (request, reply) => {
  client.query('SELECT * FROM oig.products ORDER BY date_updated DESC', (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

// Get all bizdev
const getBizdevs = (request, reply) => {
  client.query('SELECT * FROM oig.bizdev ORDER BY date_updated DESC', (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

// Get all community
const getCommunity = (request, reply) => {
  client.query('SELECT * FROM oig.community ORDER BY date_updated DESC', (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

//Get latest results
const getLatestResults = (request, reply) => {
    client.query('SELECT DISTINCT ON (owner_name) * FROM oig.results ORDER BY owner_name, date_check DESC', (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }

//Set a snapshot for latest results where results is less than 1 minutes based on date_check timestamp of latest results.
//UPDATE oig.results SET snaphot_date = $2 WHERE owner_name = $1 AND date_check > NOW() - INTERVAL '15 minutes'
//update oig.results set snapshot_date = '2020-09-11 17:18:04.825519' where owner_name = 'eos42freedom' and date_check > timestamp '2020-10-23 17:31:22' - INTERVAL '1 minute';
//date_check > TIMESTAMP '2020-10-23T17:31:22.494Z' - INTERVAL '1 minute'
const setSnapshotResults = (request, reply) => {
  const { owner_name, snapshot_date, date_check  } = request.body
  client.query(` UPDATE oig.results SET snapshot_date = $2 WHERE owner_name = $1 AND date_check > TIMESTAMPTZ $3 - INTERVAL '1 minute'`, [owner_name, snapshot_date, date_check], (error, results) => {
    if (error) {
      console.log('UPDATE oig.results SET snapshot_date =',snapshot_date,' WHERE owner_name = ',owner_name,' AND date_check > TIMESTAMP',date_check,' - INTERVAL "1 minute"')
      throw error
    }
    reply.status(200).send(`Producer modified: ${owner_name}`);
  })
}


// Get results for Particular Producer
const getResultsbyOwner = (request, reply) => {
    const owner = request.params.owner

    client.query('SELECT * FROM oig.results WHERE owner_name = $1 ORDER BY date_check ASC', [owner], (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }


//Set producer active or not - send true or false in body 
const IsProducerActive = (request, reply) => {
    const owner = request.params.owner
    const { active } = request.body

    client.query('UPDATE oig.producer SET active = $1 WHERE owner_name = $2', [active,owner], (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Producer modified: ${owner}`);
    })
  }

// Insert monthly update
const mothlyUpdate = (request, reply) => {
    const { owner_name, tech_ops, product, bizdev, community, date_update } = request.body

    client.query(
        'INSERT into oig.updates (owner_name,tech_ops,product,bizdev,community,date_update) VALUES ($1,$2,$3,$4,$5,$6)', 
        [owner_name, tech_ops, product, bizdev, community, date_update], 
        (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Producer modified: ${owner_name}`);
    })
  }

// Insert Product update
const productUpdate = (request, reply) => {
  const { owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated } = request.body

  client.query(
      'INSERT into oig.products (owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (owner_name,name) DO UPDATE SET description = EXCLUDED.description, stage = EXCLUDED.stage, analytics_url = EXCLUDED.analytics_url, spec_url = EXCLUDED.spec_url, code_repo = EXCLUDED.code_repo, score = EXCLUDED.score, points = EXCLUDED.points, date_updated= EXCLUDED.date_updated ', 
      [owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated], 
      (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(`Producer modified: ${owner_name}`);
  })
}

// Insert Bizdev update
const bizdevUpdate = (request, reply) => {
  const { owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated } = request.body

  client.query(
      'INSERT into oig.bizdev (owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (owner_name,name) DO UPDATE SET description = EXCLUDED.description, stage = EXCLUDED.stage, analytics_url = EXCLUDED.analytics_url, spec_url = EXCLUDED.spec_url, score = EXCLUDED.score, points = EXCLUDED.points, date_updated= EXCLUDED.date_updated ', 
      [owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated], 
      (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(`Producer modified: ${owner_name}`);
  })
}

// Insert Community update
const communityUpdate = (request, reply) => {
  const { owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated } = request.body

  client.query(
      'INSERT into oig.community (owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (owner_name) DO UPDATE SET origcontentpoints = EXCLUDED.origcontentpoints, transcontentpoints = EXCLUDED.transcontentpoints, eventpoints = EXCLUDED.eventpoints, managementpoints = EXCLUDED.managementpoints, score = EXCLUDED.score, date_updated= EXCLUDED.date_updated ', 
      [owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated], 
      (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(`Producer modified: ${owner_name}`);
  })
}


// Get results for Particular Producer based on Month
const getUpdatesbyOwner = (request, reply) => {
    const owner = request.params.owner
    const { month } = request.body

    client.query("SELECT * FROM oig.updates WHERE owner_name = $1 AND date_update > now() - interval '1 week' ORDER BY date_update ASC", [month], (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }

module.exports = { getProducers, getResults, getResultsbyOwner, getLatestResults, IsProducerActive, mothlyUpdate, getUpdatesbyOwner, productUpdate, getProducts, bizdevUpdate, getBizdevs, communityUpdate, getCommunity, setSnapshotResults};