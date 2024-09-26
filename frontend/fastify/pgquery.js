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
  client.query("SELECT * FROM oig.producer ORDER BY owner_name ASC", (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}

// Function to fetch owner_name_testnet by owner_name
const fetchOwnerNameTestnet = (ownerName) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT owner_name_testnet FROM oig.producer WHERE owner_name = $1";
    client.query(query, [ownerName], (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      if (results.rows.length > 0) {
        console.log('DB result:', results.rows[0].owner_name_testnet);
        resolve(results.rows[0].owner_name_testnet);
      } else {
        console.log('DB no match for:', ownerName);
        reject(new Error("Owner name not found."));
      }
    });
  });
};



const getProducerPublicKey = (owner_name) => {
  return new Promise((resolve, reject) => {
    client.query("SELECT publickey FROM oig.producer WHERE owner_name = $1", [owner_name], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};

const getProducerLogo = (owner_name) => {
  return new Promise((resolve, reject) => {
    client.query("SELECT logo_svg FROM oig.producer WHERE owner_name = $1", [owner_name], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};


const getLatestResults = (request, reply) => { 
  client.query(`
    SELECT DISTINCT ON (r.owner_name) r.* FROM oig.results r
    JOIN oig.producer p ON r.owner_name = p.owner_name
    WHERE p.active = TRUE
    ORDER BY r.owner_name, r.date_check DESC
  `, (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
  })
}



// Get all results
const getResults = (request, reply) => {
  client.query("SELECT * FROM oig.results ORDER BY date_check DESC", (error, results) => {
    if (error) {
      throw error
    }
    reply.status(200).send(results.rows);
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

// Get OIG dates
const getTelegramDates = (request, reply) => {
  client.query('SELECT * FROM oig.dates ORDER BY id DESC LIMIT 1', (error, results) => {
    if (error) {
      throw error
    }

    const row = results.rows[0];
    const formattedDates = [
      { 'type': 'Guild Update Submission Cutoff', 'date': row.submission_cutoff },
      { 'type': 'Report Appeals Begin', 'date': row.appeal_begin },
      { 'type': 'Report Appeals End', 'date': row.appeal_end },
      { 'type': 'Publish Final Report', 'date': row.final_report }
    ];

    reply.status(200).send(formattedDates);
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
  //const { month, year, days } = request.query;
  const { startDate, endDate } = request.query;
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
    COUNT(*) FILTER (WHERE hyperion_v2_full = TRUE) AS hyperion_v2_full_count,
    COUNT(*) FILTER (WHERE hyperion_v2_testnet = TRUE) AS hyperion_v2_testnet_count,
    COUNT(*) FILTER (WHERE hyperion_v2_testnet_full = TRUE) AS hyperion_v2_testnet_full_count,
    COUNT(*) FILTER (WHERE atomic_api = TRUE) AS atomic_api_count,
    COUNT(*) FILTER (WHERE cors_check = TRUE) AS cors_check_count,
    COUNT(*) FILTER (WHERE oracle_feed = TRUE) AS oracle_feed_count,
    COUNT(*) FILTER (WHERE wwwjson = TRUE) AS wwwjson_count,
    AVG(cpu_time) AS cpu_time,
    AVG(score) AS score_avg 
    from oig.results
    where owner_name = $1
    `   
    
    if (startDate && endDate) {
      qry += `and date_check BETWEEN $2 AND $3`;
      client.query(qry, [owner, startDate, endDate], (error, results) => {
        if (error) {
          throw error
        }
        processResults(results);
      });
    } else {
      client.query(qry, [owner], (error, results) => {
        if (error) {
          throw error
        }
        processResults(results);
      });
    }
    
    function processResults(results) {
      const row = results.rows[0];
      let pcts = {};
      const { total_count } = row;
      Object.keys(row).forEach(key => {
        if (key.indexOf("_count") !== -1) {
          const newKey = key.replace("_count", "_pct");
          pcts[newKey] = `${parseInt((row[key] / total_count) * 10000) / 100}%`;
        }
      })
      const vResults = { ...row, ...pcts };
      reply.status(200).send(vResults);
    }
}

const getTruncatedPaginatedResults = (request, reply) => {
  const { owner } = request.params;
  const { index, limit } = request.query;
  const start = index ? +index + 1 : 1;
  const end = limit ? +limit + 1 : 10;

  client.query(`
SELECT * FROM (
    SELECT 
        *,
        rank() OVER (PARTITION BY date_trunc('day', date_check) ORDER BY date_check DESC) AS rank
    FROM oig.results
    WHERE owner_name = $1
) AS RankedResults
WHERE rank <= 3
ORDER BY date_check DESC, rank
LIMIT $2 OFFSET $3
`, [owner, limit, (start - 1) * limit], (error, results) => {
  if (error) {
    throw error
  }
  reply.status(200).send(results.rows);
})
}


const getNodesByType = (nodeType) => {
  return new Promise((resolve, reject) => {
    let query = '';
    let features = '';

    switch (nodeType) {
      case 'hyperion':
        query = "SELECT owner_name, https_node_url, historyfull FROM oig.nodes WHERE 'hyperion-v2' = ANY(features)";
        break;
      case 'atomic':
        query = "SELECT owner_name, https_node_url FROM oig.nodes WHERE 'atomic-assets-api' = ANY(features)";
        break;
      case 'p2p':
        query = "SELECT owner_name, p2p_url FROM oig.nodes WHERE 'p2p_endpoint' = ANY(features)";
        break;
      default:
        reject(new Error('Invalid node type'));
        return;
    }

    client.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.rows);
      }
    });
  });
};


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

/* To wipe all meta snapshots:

DELETE FROM oig.adminsettings WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.bizdev WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.community WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.products WHERE metasnapshot_date IS NOT NULL;
DELETE FROM oig.pointsystem WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.results WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.producer WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';

*/




module.exports = {   getLatestResults, getProducers,  getResults, getResultsbyOwner, getUpdatesbyOwner, getPaginatedResultsByOwner, getTruncatedPaginatedResults, getAverageMonthlyResult, getProducerPublicKey,getTelegramDates,getProducerLogo,fetchOwnerNameTestnet,getNodesByType };
