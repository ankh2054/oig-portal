const { port } = require('./config');
const path = require('path');
const cors = require('@fastify/cors');

let got;
import('got').then((module) => {
  got = module.default;
});


const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    logger: true // Used to check how much requests come through from the React frontend
})
import('got').then((got) => {
    // Your code that uses the got module goes here
  }).catch((err) => {
    console.error('Error importing got module:', err);
  });


// CORS setup
fastify.register(cors, { 
    // put your options here
  })


// replace fastify-compress with @fastify/compress
fastify.register(require('@fastify/compress'));

//fastify.register(fastifyCompress)


const db = require('./pgquery')

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  });


//Python API
fastify.get('/api/rescan', async (request, reply) => {
try {
    const ignoreCpuCheck = request.query.ignorecpucheck || 'false'
    const ignoreLastCheck = request.query.ignorelastcheck || 'true'
    const bp = request.query.bp 
    const apiUrl = `http://127.0.0.1:8000/run?ignorecpucheck=${ignoreCpuCheck}&ignorelastcheck=${ignoreLastCheck}&bp=${bp}`
    const response = await got(apiUrl)
    const data = JSON.parse(response.body)
    console.log(data)
    reply.send(data)
} catch (error) {
    console.log(error)
    reply.code(500).send('Internal server error')
}
})


// PG Routes//
fastify.get('/api/producers', db.getProducers)
//fastify.get('/api/results', db.getResults)
fastify.get('/api/latestresults', db.getLatestResults)
// Monthly average results used for percentages
fastify.get('/api/monthlyaverageresults/:owner', db.getAverageMonthlyResult)
// Truncated monthly results for guild page
fastify.get('/api/truncatedPaginatedResults/:owner', db.getTruncatedPaginatedResults)




// Starts the Fastify Server //
const start = async () => {
  try {
    await fastify.listen({ port: port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};


start();