// Load env variables from the config.js
const { pguser, pgport, pgpassword, pgdb, pghost } = require('./config');

const { Client } = require('pg');
const moment = require('moment');

const client = new Client({
  user: pguser,
  password: pgpassword,
  host: pghost,
  database: pgdb,
  port: pgport
})

client.connect()

// Get all producers
const getProducers = (request, reply) => {
  client.query('SELECT * FROM oig.producer ORDER BY owner_name ASC', (error, results) => {
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
  const { metasnapshot_date } = request.params 
  client.query(`SELECT DISTINCT ON (owner_name) * FROM oig.results WHERE metasnapshot_date = timestamp '${metasnapshot_date && metasnapshot_date !== 'None' && metasnapshot_date !== 'null' ? metasnapshot_date : '1980-01-01 00:00:00'}' ORDER BY owner_name, date_check DESC`, (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

//Get latest tech results from snapshots
const getSnapshotResults = (request, reply) => {
  client.query('SELECT DISTINCT ON (owner_name) * FROM oig.results ORDER BY owner_name, snapshot_date DESC', (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

//Get latest Snapshot results
const getLatestSnapshotResults = (request, reply) => {
  let query;
  const { metasnapshot_date } = request.params   
  if(metasnapshot_date && metasnapshot_date !== 'None'){
    query = `SELECT DISTINCT ON (owner_name) * FROM oig.results WHERE metasnapshot_date = timestamp '${metasnapshot_date}' ORDER BY owner_name, snapshot_date DESC`
  }else{
    query = 'SELECT DISTINCT ON (owner_name) * FROM oig.results WHERE snapshot_date IS NOT NULL ORDER BY owner_name, snapshot_date DESC'
  }
  // console.log('******************')
  // console.log('Metasnpshot date is', metasnapshot_date)  
  // console.log('******************')  
  // console.log('query is', query)
  client.query(query, (error, results) => {
    if (error) {
      console.log('There was an errro with this operation', error)
    }
    reply.status(200).send(results.rows); 
  })
}


// Get snapshot settings (just date for now)
const getSnapshotSettings = (request, reply) => {
  client.query('SELECT * FROM oig.snapshotsettings', (error, results) => {
    if (error) {
      console.log('There was an errro with this operation', error)
    }
    reply.status(200).send(results.rows);
  })
}

const getPointSystem = (request, reply) => {
  client.query('SELECT * FROM oig.pointsystem', (error, results) => {
    if (error) {
      console.log('There was an errro with this operation', error)
    }
    reply.status(200).send(results.rows);
  })
}

// Update point system
const updatePointSystem = (request, reply) => {
  const { points_type, points, multiplier, min_requirements } = request.body
  const toUpdate = (multiplier ? "multiplier=" + multiplier : "") + (points && multiplier ? ", " : "") + (points ? "points=" + points : "") + (min_requirements ? ", min_requirements=" + min_requirements : "");
  client.query(
    `UPDATE oig.pointsystem SET ${toUpdate} WHERE points_type= $1 AND metasnapshot_date = timestamp '1980-01-01 00:00:00' `,
    [points_type],
    (error, results) => {
      if (error) {
        console.log('There was an error with this operation', error.message) 
      }
      reply.status(200).send(`Points/multiplier for ${points_type} updated: ${points} * ${multiplier}`);
    })
}

const getAdminSettings = (request, reply) => {
  // console.log(pguser, pgport, pgpassword, pgdb, pghost)
  client.query('SELECT * FROM oig.adminsettings', (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

// Update point system
const updateAdminSettings = (request, reply) => {
  const { minimum_tech_score } = request.body

  const toUpdate = (minimum_tech_score ? `minimum_tech_score=${minimum_tech_score} WHERE metasnapshot_date = timestamp '1980-01-01'` : "");
  const qry = `UPDATE oig.adminsettings SET ${toUpdate}`;

  if (toUpdate === "") {
    reply.status(400).send(`No updates sent`);
  } else {
    client.query(
      `UPDATE oig.adminsettings SET ${toUpdate}`,
      (error, results) => {
        if (error) {
          throw error
        }
        reply.status(200).send(`Minimum tech score updated`);
      })
  }
}

//Set a snapshot for latest results where results is less than 1 minutes based on date_check timestamp of latest results.
//UPDATE oig.results SET snaphot_date = $2 WHERE owner_name = $1 AND date_check > NOW() - INTERVAL '15 minutes'
//update oig.results set snapshot_date = '2020-09-11 17:18:04.825519' where owner_name = 'eos42freedom' and date_check > timestamp '2020-10-23 17:31:22' - INTERVAL '1 minute';
//date_check > TIMESTAMP '2020-10-23T17:31:22.494Z' - INTERVAL '1 minute'
const setSnapshotResults = (request, reply) => {
  const { owner_name, snapshot_date, date_check } = request.body;
  var snapshotdate = moment.utc(snapshot_date)
  var datecheck = moment.utc(date_check).subtract(1, "minutes");
  client.query(
    'UPDATE oig.results SET snapshot_date = $2 WHERE owner_name = $1 AND date_check > $3',
    [owner_name, snapshotdate, datecheck],
    (error, results) => {
      if (error) {
        console.log(
          "UPDATE oig.results SET snapshot_date =",
          snapshot_date,
          " WHERE owner_name = ",
          owner_name,
          " AND date_check > TIMESTAMP",
          date_check,
          ' - INTERVAL "1 minute"'
        );
        throw error;
      }
      reply.status(200).send(`Producer modified: ${owner_name}`);
    }
  );
};



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

// Paginated results for particular owner
const getPaginatedResultsByOwner = (request, reply) => {
  const { owner } = request.params;
  const { index, limit } = request.query;
  const start = index ? +index + 1 : 1;
  const end = limit ? +limit + 1 : 10;

  client.query('SELECT  * FROM ( SELECT ROW_NUMBER() OVER ( ORDER BY date_check DESC ) AS RowNum, * FROM oig.results WHERE owner_name = $1 ) AS RowConstrainedResult WHERE RowNum >= $2 AND RowNum <= $3 ORDER BY RowNum', [owner, start, end], (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

const getAverageMonthlyResult = (request, reply) => {
  const { owner } = request.params;
  const { month, year, days } = request.query;
  let qry = `select 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE chains_json = TRUE) AS chains_json_count, 
    COUNT(*) FILTER (WHERE wax_json = TRUE) AS wax_json_count, 
    COUNT(*) FILTER (WHERE api_node = TRUE) AS api_node_count, 
    COUNT(*) FILTER (WHERE seed_node = TRUE) AS seed_node_count, 
    COUNT(*) FILTER (WHERE http_check = TRUE) AS http_check_count, 
    COUNT(*) FILTER (WHERE https_check = TRUE) AS https_check_count,
    COUNT(*) FILTER (WHERE tls_check = 'TLS v1.2') AS tls_ver_count,
    COUNT(*) FILTER (WHERE http2_check = TRUE) AS http2_check_count,
    COUNT(*) FILTER (WHERE full_history = TRUE) AS history_v1_count,
    COUNT(*) FILTER (WHERE hyperion_v2 = TRUE) AS hyperion_v2_count,
    COUNT(*) FILTER (WHERE hyperion_v2_testnet = TRUE) AS hyperion_v2_testnet_count,
    COUNT(*) FILTER (WHERE atomic_api = TRUE) AS atomic_api_count,
    COUNT(*) FILTER (WHERE cors_check = TRUE) AS cors_check_count,
    COUNT(*) FILTER (WHERE oracle_feed = TRUE) AS oracle_feed_count,
    COUNT(*) FILTER (WHERE snapshots = TRUE) AS snapshots_count,
    AVG(cpu_avg) AS cpu_avg,
    AVG(score) AS score_avg 
    from oig.results
    where owner_name = $1
    `   
    
    if(!!month && year !== 'None'){
      const vMonth = !!month ? parseInt(month) : 'extract(month FROM current_date)';
      const vYear = !!year ? parseInt(year) : 'extract(year FROM current_date)';
      qry = qry + `and extract(month FROM date_check) = ${vMonth}
      and extract(year FROM date_check) = ${vYear}`    
    } else if(days) {   
    const vDays = parseInt(days);
    qry = qry + `and date_check > current_date - interval '${vDays}' day`;
  }   
  
  client.query(qry, [owner], (error, results) => {
    if (error) {
      throw error
    }
    const row = results.rows[0];
    let pcts = {};
    const { total_count } = row;
    Object.keys(row).forEach(key => {
      if (key.indexOf("_count") !== -1) {
        const newKey = key.replace("_count", "_pct");
        pcts[newKey] = `${parseInt((row[key] / total_count) * 10000) / 100}%`;
      }
    })
    const vResults = { ...row, ...pcts, month, year };
    reply.status(200).send(vResults);
  })
}

const getTruncatedPaginatedResults = (request, reply) => {
  const { owner } = request.params;
  const { index, limit } = request.query;
  const start = index ? +index + 1 : 1;
  const end = limit ? +limit + 1 : 10;

  client.query(`SELECT * FROM ( SELECT ROW_NUMBER() OVER ( ORDER BY date_check DESC ) AS RowNum, * FROM (select distinct on (date_trunc('day', date_check)) * from oig.results where owner_name = $1) AS DistinctSet ) AS RowConstrainedResult WHERE RowNum >= $2 AND RowNum <= $3 ORDER BY RowNum`, [owner, start, end], (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

/* Get the max and min values for various days:

select  cast(date_check as date)
,       min(score) as MinScore
,       max(score) as MaxScore
from    oig.results
where owner_name = 'sentnlagents'
group by 
        cast(date_check as date)
order by date_check DESC

gives results like:

2021-01-09	119.7365	119.7365
2021-01-08	119.7365	119.7365
2021-01-05	82.8945	101.3155
2021-01-03	82.8945	82.8945
2020-12-27	101.3155	147.368
2020-12-09	147.368	147.368

*/

// Set producer active or not - send true or false in body
// OIG admin page 
const IsProducerActive = (request, reply) => {
  const owner = request.params.owner
  const { active } = request.body

  client.query('UPDATE oig.producer SET active = $1 WHERE owner_name = $2', [active, owner], (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(`${owner} is active: ${active ? "true" : "false"}`);
  })
}


// Set producer account_name
const setAccountName = (request, reply) => {
  const owner = request.params.owner
  const { account_name } = request.body

  client.query('UPDATE oig.producer SET account_name = $1 WHERE owner_name = $2', [account_name, owner], (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(`Account name for ${owner} set to ${account_name}`);
  })
}

// Set producer account_name
const updateProducer = (request, reply) => {
  const owner = request.params.owner 
  const { account_name, active } = request.body
 
  client.query(`UPDATE oig.producer SET "active" = $1, "account_name" = $2 WHERE "owner_name" = $3 AND metasnapshot_date = timestamp '1980-01-01 00:00:00'`, [active, account_name, owner], (error, results) => {
    if (error) {
      console.log('There was an error with this Update operation', error.message) 
    }
    reply.status(200).send(`Account name for ${owner} set to ${account_name}, active state set to ${active}`);
  })
}

// Insert monthly update
// ???????
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

// Add comments to tech result
// OIG admin page
const snapshotResultCommentUpdate = (request, reply) => {
  const { owner_name, date_check, comments, score } = request.body
  const utcDate = moment.utc(date_check).subtract(1, "minutes");
  client.query(
    'UPDATE oig.results SET comments=($1), score=($4) WHERE ctid IN (SELECT ctid FROM oig.results WHERE owner_name=($2) AND date_check > ($3) LIMIT 1 FOR UPDATE)',
    [comments, owner_name, utcDate, score],
    (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`${owner_name}'s result for ${date_check} updated with comments "${comments}" and score ${score}`);
    })
}

// Insert Product update
// OIG admin page
const productUpdate = (request, reply) => {
  const { owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated, comments } = request.body

  client.query(
    'INSERT into oig.products (owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated, comments) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (owner_name,name,metasnapshot_date) DO UPDATE SET description = EXCLUDED.description, stage = EXCLUDED.stage, analytics_url = EXCLUDED.analytics_url, spec_url = EXCLUDED.spec_url, code_repo = EXCLUDED.code_repo, score = EXCLUDED.score, points = EXCLUDED.points, date_updated= EXCLUDED.date_updated, comments= EXCLUDED.comments ',
    [owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated, comments],
    (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Producer modified: ${owner_name}`);
    })
}

// Insert Bizdev update
// OIG admin page
const bizdevUpdate = (request, reply) => {
  const { owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated, comments } = request.body

  client.query(
    'INSERT into oig.bizdev (owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated, comments) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (owner_name,name,metasnapshot_date) DO UPDATE SET description = EXCLUDED.description, stage = EXCLUDED.stage, analytics_url = EXCLUDED.analytics_url, spec_url = EXCLUDED.spec_url, score = EXCLUDED.score, points = EXCLUDED.points, date_updated= EXCLUDED.date_updated, comments= EXCLUDED.comments ',
    [owner_name, name, description, stage, analytics_url, spec_url, score, points, date_updated, comments],
    (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Producer modified: ${owner_name}`);
    })
}

// Insert Community update
// OIG admin page
const communityUpdate = (request, reply) => {
  const { owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments } = request.body

  client.query(
    'INSERT into oig.community (owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9) ON CONFLICT (owner_name,metasnapshot_date) DO UPDATE SET origcontentpoints = EXCLUDED.origcontentpoints, transcontentpoints = EXCLUDED.transcontentpoints, eventpoints = EXCLUDED.eventpoints, managementpoints = EXCLUDED.managementpoints, score = EXCLUDED.score, date_updated= EXCLUDED.date_updated, comments= EXCLUDED.comments ',
    [owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments],
    (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Producer modified: ${owner_name}`);
    })
}

// Update snapshot date
const updateSnapshotDate = (request, reply) => {
  const { newDate } = request.body
  client.query(
    'UPDATE oig.snapshotsettings SET snapshot_date=($1) WHERE ctid IN (SELECT ctid FROM oig.snapshotsettings LIMIT 1 FOR UPDATE)',
    [newDate],
    (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(`Snapshot date updated to: ${newDate}`);
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

// Delete product, bizdev, or community item
const deleteItem = (request, reply) => {
  const { type, owner_name, name } = request.body;

  if (!type) {
    reply.status(400).send('Please include type');
  }

  if (!owner_name) {
    reply.status(400).send('Please include owner');
  }

  if ((type !== 'community' && type !== 'producer') && !name) {
    reply.status(400).send('Please include name');
  }

  const query = [
    `DELETE FROM "oig"."${type === 'product' ? 'products' : type}" WHERE "owner_name"='${owner_name}'`,
    `AND "name"='${name}'`
  ]

  client.query(((type === 'community' || type === 'producer') ? query[0] : query.join(' ')), [], (error, results) => {
    if (error) {
      reply.status(500).send('Failed: ' + error.message);
    }
    reply.status(200).send('Deleted');
  })
}

const addNewGuild = (request, reply) => {
  const { owner_name, url, account_name } = request.body
  const active = true;
  client.query(
    `INSERT INTO "oig"."producer"("owner_name", "candidate", "url", "jsonurl", "chainsurl", "active", "account_name", "metasnapshot_date") VALUES($1, ' ', $2, ' ', ' ', $3, $4, timestamp '1980-01-01 00:00:00')`,
    [owner_name, url, active, account_name],
    (error, results) => {
      if (error) {
        reply.status(500).send('Failed: ' + error.message);
      }
      reply.status(200).send(`Guild created! ${owner_name}`);
    })
}

/* To wipe all meta snapshots:

DELETE FROM oig.adminsettings WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.bizdev WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.community WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.products WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.pointsystem WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.results WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.producer WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';

*/



//DELETE FROM oig.producer WHERE metasnapshot_date IS NOT NULL;
const addMetaSnapshot = (request, reply) => {
  client.query("INSERT INTO oig.adminsettings (minimum_tech_score, metasnapshot_date) SELECT minimum_tech_score, CURRENT_DATE FROM oig.adminsettings WHERE metasnapshot_date IS NULL; INSERT INTO oig.bizdev (owner_name, name, description, stage, analytics_url, spec_url, score, date_updated, points, comments, metasnapshot_date) SELECT owner_name, name, description, stage, analytics_url, spec_url, score, date_updated, points, comments, CURRENT_DATE FROM oig.bizdev WHERE metasnapshot_date IS NULL; INSERT INTO oig.community (owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments, metasnapshot_date) SELECT owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments, CURRENT_DATE FROM oig.community WHERE metasnapshot_date IS NULL; INSERT INTO oig.pointsystem (points_type, points, multiplier, min_requirements, metasnapshot_date) SELECT points_type, points, multiplier, min_requirements, CURRENT_DATE FROM oig.pointsystem WHERE metasnapshot_date = timestamp '1980-01-01 00:00:00'; INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl, active, logo_svg, top21, country_code, account_name, metasnapshot_date) SELECT owner_name, candidate, url, jsonurl, chainsurl, active, logo_svg, top21, country_code, account_name, CURRENT_DATE FROM oig.producer WHERE metasnapshot_date = timestamp '1980-01-01 00:00:00'; INSERT INTO oig.products (owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, date_updated, points, comments, metasnapshot_date) SELECT owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, date_updated, points, comments, CURRENT_DATE FROM oig.products WHERE metasnapshot_date IS NULL; INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, http2_check, http2_check_error, full_history, full_history_error, snapshots, snapshots_error, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, date_check, score, tls_check, tls_check_error, cpu_avg, snapshot_date, hyperion_v2, hyperion_v2_error, producer_api_error, producer_api_check, net_api_check, net_api_error, dbsize_api_check, dbsize_api_error, comments, atomic_api, atomic_api_error, metasnapshot_date) SELECT DISTINCT ON (owner_name) owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, http2_check, http2_check_error, full_history, full_history_error, snapshots, snapshots_error, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, date_check, score, tls_check, tls_check_error, cpu_avg, snapshot_date, hyperion_v2, hyperion_v2_error, producer_api_error, producer_api_check, net_api_check, net_api_error, dbsize_api_check, dbsize_api_error, comments, atomic_api, atomic_api_error, CURRENT_DATE FROM oig.results WHERE snapshot_date IS NOT NULL AND metasnapshot_date = timestamp '1980-01-01 00:00:00' ORDER BY owner_name, snapshot_date DESC;", (err, res) => {
    if (err && err.message.indexOf("duplicate") !== -1) {
      reply.status(400).send("Metasnapshot already made (" + err.message + ")");
    } else if (err) {
      reply.status(500).send(err.message);
    } else {
      reply.status(200).send('Made metasnapshot!');
    }
  })
}

module.exports = { addMetaSnapshot, deleteItem, IsProducerActive, bizdevUpdate, communityUpdate, getBizdevs, getCommunity, getLatestResults, getLatestSnapshotResults, getPointSystem, updatePointSystem, getProducers, getProducts, getResults, getResultsbyOwner, getSnapshotResults, getSnapshotSettings, getUpdatesbyOwner, mothlyUpdate, productUpdate, setSnapshotResults, updateSnapshotDate, snapshotResultCommentUpdate, getPaginatedResultsByOwner, addNewGuild, getTruncatedPaginatedResults, setAccountName, updateProducer, getAdminSettings, updateAdminSettings, getAverageMonthlyResult };
