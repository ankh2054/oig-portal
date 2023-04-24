const { port } = require('./config');
const path = require('path');


const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    logger: true // Used to check how much requests come through from the React frontend
})
const got = require('got')


// CORS setup
fastify.register(require('fastify-cors'), { 
    // put your options here
  })

//Compression
const fastifyCompress = require('fastify-compress')

fastify.register(fastifyCompress)


const db = require('./pgquery')

//Routes/////////
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  })


//Python API
fastify.get('/runcheck', async (request, reply) => {
try {
    const ignoreCpuCheck = request.query.ignorecpucheck || 'false'
    const ignoreLastCheck = request.query.ignorelastcheck || 'true'
    const bp = request.query.bp || 'eosriobrazil'
    const apiUrl = `http://127.0.0.1:8000/run?ignorecpucheck=${ignoreCpuCheck}&ignorelastcheck=${ignoreLastCheck}&bp=${bp}`
    const response = await got(apiUrl)
    const data = JSON.parse(response.body)
    reply.send(data)
} catch (error) {
    console.log(error)
    reply.code(500).send('Internal server error')
}
})


fastify.get('/latestresults', (req, reply) => reply.sendFile('index.html'))
fastify.get('/guilds/*', (req, reply) => reply.sendFile('index.html'))

// PG Routes//
fastify.get('/api/producers', db.getProducers)
fastify.get('/api/results', db.getResults)
fastify.get('/api/latestresults', db.getLatestResults)
// Monthly average results used for percentages
fastify.get('/api/monthlyaverageresults/:owner', db.getAverageMonthlyResult)
// Truncated monthly results for guild page
fastify.get('/api/truncatedPaginatedResults/:owner', db.getTruncatedPaginatedResults)





//fastify.get('/api/latestresults/:metasnapshot_date', db.getLatestResults)
// Get latest tech results based on snapshot date
//fastify.get('/api/results/:owner', db.getResultsbyOwner)
// Paginated results by owner (requires index & limit in body)
//fastify.get('/api/paginatedresults/:owner', db.getPaginatedResultsByOwner)
//fastify.get('/api/snapshotlatestresults/:metasnapshot_date', db.getLatestSnapshotResults)



// Starts the Fastify Server //
const start = async () => {
    try {
        await fastify.listen(port, '0.0.0.0');
        fastify.log.info(`Server listening on ${fastify.server.address().port}`);
    }
    catch(err) {
        fastify.log.error(err)
        process.exit(1);
    }
}

start();