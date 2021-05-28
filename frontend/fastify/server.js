const { port } = require('./config');
const path = require('path');


const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    logger: true // Used to check how much requests come through from the React frontend
})

// CORS setup
fastify.register(require('fastify-cors'), { 
    // put your options here
  })

const db = require('./pgquery')

//Routes/////////
fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  })

fastify.get('/snapshot', (req, reply) => reply.sendFile('index.html'))
fastify.get('/admin', (req, reply) => reply.sendFile('index.html')) 
fastify.get('/form', (req, reply) => reply.sendFile('index.html'))  
fastify.get('/latestresults', (req, reply) => reply.sendFile('index.html'))


// PG Routes//
fastify.get('/api/producers', db.getProducers)
fastify.get('/api/results', db.getResults)
fastify.get('/api/products', db.getProducts)
fastify.get('/api/bizdevs', db.getBizdevs)
fastify.get('/api/community', db.getCommunity)
fastify.get('/api/latestresults', db.getLatestResults)
// Get latest tech results based on snapshot date
fastify.get('/api/snapshottechresults', db.getSnapshotResults)
fastify.get('/api/results/:owner', db.getResultsbyOwner)
// Paginated results by owner (requires index & limit in body)
fastify.get('/api/paginatedresults/:owner', db.getPaginatedResultsByOwner)
fastify.get('/api/snapshotlatestresults', db.getLatestSnapshotResults)
// Admin panel related items: snapshot settings (including snapshot date), and point system
fastify.get('/api/snapshotsettings', db.getSnapshotSettings)
fastify.get('/api/pointsystem', db.getPointSystem)
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
// Comment on guild latest (snapshot) tech result
fastify.post('/api/snapshotResultCommentUpdate', db.snapshotResultCommentUpdate)
// Retrieve momthly updates based on month
fastify.post('/api/monthlyUpdates/:owner', db.getUpdatesbyOwner)
// Update snapshot date and point system
fastify.post('/api/updateSnapshotDate', db.updateSnapshotDate)
fastify.post('/api/updatePointSystem', db.updatePointSystem)
// Delete items
fastify.post('/api/deleteItem', db.deleteItem)

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