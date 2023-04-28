const { port } = require('./config');
const path = require('path');
const cors = require('@fastify/cors');
const dotenv = require('dotenv');
const { Signature, PublicKey, Transaction } = require('@greymass/eosio');
const fastifyJwt = require('@fastify/jwt');
const db = require('./pgquery')

dotenv.config();
const chainId = process.env.CHAINID;
const fastapi = process.env.PYTHON_FASTAPI

const fastify = require('fastify')({
  ignoreTrailingSlash: true,
  logger: true // Used to check how much requests come through from the React frontend
})

// CORS setup
fastify.register(cors, { 
  // put your options here
})


// replace fastify-compress with @fastify/compress
fastify.register(require('@fastify/compress'));

let got;
import('got').then((module) => {
  got = module.default;
});


// Register the fastify-jwt plugin
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'superduperwhoknowsifitwilleverwork786123487612387462137684', // Use a secret from .env or provide a fallback
});


fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
  });


  const getProducerPublicKeyHandler = async (authorizer) => {
    try {
      const publicKey = await db.getProducerPublicKey(authorizer);
      return publicKey;
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  };
  

  async function decode_jwt_token(request, fastify) {
    try {
      // Get the JWT token from the Authorization header
      const token = request.headers.authorization.split(' ')[1];
  
      // Verify the JWT token using the secret key
      const decodedToken = await fastify.jwt.verify(token);
  
      return decodedToken;
    } catch (err) {
      console.error('Error decoding JWT token:', err);
      throw err;
    }
  }

  
// Core login function for Acnhor wallet
  fastify.post('/login', async (request, reply) => {
  try {
    const { signature, transaction } = request.body;

    // Step 1: Extract the authorizer from the transaction
    const { authorization } = transaction.actions[0];
    const authorizer = authorization[0].actor;

    // Step 2: Fetch the associated public key from the blockchain
    const publicKey = await getProducerPublicKeyHandler(authorizer);
    console.log('Public key:', publicKey);
    console.log('authorizer:', authorizer);

    // Get the digest from transaction
    const digest = Transaction.from(transaction).signingDigest(chainId);

    let signatureInstance;
    let isSignatureValid;
    try {
      signatureInstance = Signature.from(signature);
      const publickey2 = signatureInstance.recoverDigest(digest);
      /** Return key in modern EOSIO format (`PUB_<type>_<base58data>`) */
      const K1Publickeyformat = publickey2.toString();
       /** Create PublicKey object from representing types. */
      const publicKeyInstance = PublicKey.from(K1Publickeyformat);
      isSignatureValid = signatureInstance.verifyDigest(digest, publicKeyInstance);
      // Check actual signature from transaction
      //const legacyPublicKeyString = publickey2.toLegacyString();
      //const legacyPublicKeyString2 = publickey2.toString();
      //console.log('Public key from transaction:', legacyPublicKeyString, legacyPublicKeyString2);
      //console.log('Actual Public key derived:', publickey2);
    } catch (error) {
      console.error("Error in Step 3:", error);
    }

    if (isSignatureValid) {
      const message = `The signature is valid for account ${authorizer}`;
      // Issue JWT token
      const token = fastify.jwt.sign({
        account: authorizer,
      });
      reply.status(200).send({ message, token });
    } else {
      const message = 'The signature is invalid';
      reply.status(406).send({ message });
    }
  } catch (error) {
    const message = `An error occurred: ${error}`;
    reply.status(404).send({ message });
  }
});

// Add a helper function to verify the JWT
const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send({ message: 'You need to login first using your Guild active key before scanning' , type: 'warning'});
    }
  };


// Send request to python API 
fastify.get('/api/rescan/:owner_name', { preHandler: authenticate }, async (request, reply) => {
  try {
    const decodedToken = await decode_jwt_token(request, fastify);
    const { owner_name } = request.params;

    // Compare the two variables using loose equality
    if (decodedToken.account == owner_name) {
      const ignoreCpuCheck = request.query.ignorecpucheck || 'false';
      const ignoreLastCheck = request.query.ignorelastcheck || 'true';
      const apiUrl = `http://127.0.0.1:8000/run?ignorecpucheck=${ignoreCpuCheck}&ignorelastcheck=${ignoreLastCheck}&bp=${decodedToken.account}`;
      const response = await got(apiUrl);
      const data = JSON.parse(response.body);
      console.log(data);
      reply.send(data);
    } else {
      console.log('ACcounts:',decodedToken.account,owner_name)
      reply.send({ message: 'You can only scan your own Guld instance' });
      return
    }
  } catch (error) {
    console.log(error);
    reply.code(500).send('Internal server error');
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
// Get Telegram dates
fastify.get('/api/dates', db.getTelegramDates)




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