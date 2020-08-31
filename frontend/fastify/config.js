// load .env variables
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  port: process.env.PORT,
  pguser: process.env.PGUSER,
  pgport: process.env.PGPORT,
  pgpassword: process.env.PGPASSWORD,
  pgdb: process.env.PGDB,
  pghost: process.env.PGHOST
};