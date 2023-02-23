const { pguser, pgport, pgpassword, pgdb, pghost } = require('./config');

const { Client } = require('pg');

const client = new Client ({
    user: pguser,
    password: pgpassword,
    host: pghost,
    database: pgdb,
    port: pgport
})

console.log(pguser,pgpassword,pghost,pgdb,pgport)

client.connect();

const query = `
SELECT *
FROM oig.producer
`;

client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    for (let row of res.rows) {
        console.log(row);
    }
    client.end();
});

