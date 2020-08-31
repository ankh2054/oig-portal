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
//Get latest results
const getLatestResults = (request, reply) => {
    client.query('SELECT DISTINCT ON (owner_name) * FROM oig.results ORDER BY owner_name, date_check DESC', (error, results) => {
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


// Get results for Particular Producer based on Month
const getUpdatesbyOwner = (request, reply) => {
    const owner = request.params.owner
    const { month } = request.body

    client.query("SELECT * FROM oig.updates WHERE owner_name = $1 AND date_update > now() - interval '1 week' ORDER BY date_update ASC", [owner], (error, results) => {
      if (error) {
        throw error
      }
      reply.status(200).send(results.rows);
    })
  }

module.exports = { getProducers, getResults, getResultsbyOwner, getLatestResults, IsProducerActive, mothlyUpdate, getUpdatesbyOwner};