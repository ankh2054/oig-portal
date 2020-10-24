const { port } = require('./config');


const fastify = require('fastify')({
    ignoreTrailingSlash: true
})

// CORS setup
fastify.register(require('fastify-cors'), { 
    // put your options here
  })

const db = require('./pgquery')

//Routes/////////
fastify.get('/', (request, reply)=>{
    reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ hello: 'world' })
});

// PG Routes//
fastify.get('/api/producers', db.getProducers)
fastify.get('/api/results', db.getResults)
fastify.get('/api/products', db.getProducts)
fastify.get('/api/bizdevs', db.getBizdevs)
fastify.get('/api/community', db.getCommunity)
fastify.get('/api/latestresults', db.getLatestResults)
fastify.get('/api/results/:owner', db.getResultsbyOwner)
// Create snapshot 
fastify.post('/api/snapshot', db.setSnapshotResults)
// Activate or deactivate producer
fastify.put('/api/activeproducer/:owner', db.IsProducerActive)
// Guild add monthly updates
fastify.post('/api/monthlyUpdate', db.mothlyUpdate)
// Guild product updates/insert
fastify.post('/api/productUpdate', db.productUpdate)
// Guild Bizdev updates/insert
fastify.post('/api/bizdevUpdate', db.bizdevUpdate)
// Guild Community updates/insert
fastify.post('/api/communityUpdate', db.communityUpdate)
// Retrieve momthly updates based on month
fastify.post('/api/monthlyUpdates/:owner', db.getUpdatesbyOwner)


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