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
fastify.get('/producers', db.getProducers)
fastify.get('/results', db.getResults)
fastify.get('/products', db.getProducts)
fastify.get('/bizdevs', db.getBizdevs)
fastify.get('/community', db.getCommunity)
fastify.get('/latestresults', db.getLatestResults)
fastify.get('/results/:owner', db.getResultsbyOwner)
// Activate or deactivate producer
fastify.put('/activeproducer/:owner', db.IsProducerActive)
// Guild add monthly updates
fastify.post('/monthlyUpdate', db.mothlyUpdate)
// Guild product updates/insert
fastify.post('/productUpdate', db.productUpdate)
// Guild Bizdev updates/insert
fastify.post('/bizdevUpdate', db.bizdevUpdate)
// Guild Community updates/insert
fastify.post('/communityUpdate', db.communityUpdate)
// Retrieve momthly updates based on month
fastify.post('/monthlyUpdates/:owner', db.getUpdatesbyOwner)


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