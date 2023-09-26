const { port } = require('./config');
const path = require('path');
const cors = require('@fastify/cors');
const dotenv = require('dotenv');
const { Signature, PublicKey, Transaction } = require('@greymass/eosio');
const fastifyJwt = require('@fastify/jwt');
const db = require('./pgquery')
const axios = require('axios');

dotenv.config();
const chainId = process.env.CHAINID;
const PYTHON_FASTAPI = process.env.PYTHON_FASTAPI
const TESTNET_MISSINGBLOCK_URL = process.env.TESTNET_MISSINGBLOCKURL
const MAINNET_MISSINGBLOCK_URL = process.env.MAINNET_MISSINGBLOCKURL


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

  const getProducerLogoHandler = async (authorizer) => {
    try {
      const logo = await db.getProducerLogo(authorizer);
      return logo;
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      throw error;
    }
  };



  const getOwnerNameTestnet = async (ownerName) => {
    console.log(`Inside getOwnerNameTestnet with ownerName: ${ownerName}`);
    try {
      const testnetName = await db.fetchOwnerNameTestnet(ownerName);
      return testnetName;
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


// Core login function for Anchor wallet
  fastify.post('/login', async (request, reply) => {
  try {
    const { signature, transaction } = request.body;

    // Step 1: Extract the authorizer from the transaction
    const { authorization } = transaction.actions[0];
    const authorizer = authorization[0].actor;

    // Step 2: Fetch the associated public key from the DB
    const publicKey = await getProducerPublicKeyHandler(authorizer);
    // Get Logo
    const guildLogo = await getProducerLogoHandler(authorizer);
    //console.log('authorizer:', authorizer);

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
      console.error("Error in  singature verification:", error);
    }

    if (isSignatureValid) {
      const message = `The signature is valid for account ${authorizer}`;
      // Issue JWT token
      const token = fastify.jwt.sign({
        account: authorizer,
      });
      const user = { avatar: guildLogo.logo_svg, username: authorizer }
      reply.status(200).send({ message, token, user });
      console.log({ message, token, user })
      //reply.status(200).send({ message, token });
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
      const apiUrl = `${PYTHON_FASTAPI}/run?ignorecpucheck=${ignoreCpuCheck}&ignorelastcheck=${ignoreLastCheck}&bp=${decodedToken.account}`;
      const response = await got(apiUrl);
      const data = JSON.parse(response.body);
      reply.send({ message: data.message, type: 'success'});
    } else {
      console.log('ACcounts:',decodedToken.account,owner_name)
      reply.send({ message: 'You can only scan your own Guild instance', type: 'warning'});
      return
    }
  } catch (error) {
    console.log(error);
    reply.code(500).send('Internal server error');
  }
})

function insertDummyDataIfEmpty(apiResponse) {
  if (apiResponse.data && apiResponse.data.length === 0) {
    const startDate = new Date(apiResponse.startDate);
    const endDate = new Date(apiResponse.endDate);
    const oneDayMilliseconds = 24 * 60 * 60 * 1000;
    const days = Math.ceil((endDate - startDate) / oneDayMilliseconds);

    let dummyDataset = [];  // Temporary storage for dummy data

    for (let i = 0; i < days; i++) {
      const dateObj = new Date(startDate.getTime() + i * oneDayMilliseconds);

      const dummyData = {
        owner_name: apiResponse.ownerName,
        block_number: 231959980 + i,  // Adjust this based on your needs.
        date: dateObj.toISOString(),
        round_missed: false,
        blocks_missed: false,
        missed_block_count: 0
      };

      dummyDataset.push(dummyData);
    }

    apiResponse.data = dummyDataset.reverse();  // No need to reverse as we're incrementing the date
  }

  return apiResponse;
}




// Block Reliability 
fastify.get('/api/missing-blocks', async (req, reply) => {
  let testName
  const ownerName = req.query.ownerName;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const top21 = req.query.top21 === 'true';  // Convert the string representation to boolean

  if (!ownerName || typeof top21 !== 'boolean') {
    return reply.status(400).send({
      success: false,
      error: {
        kind: "user_input",
        message: "Invalid or missing parameters",
      },
    });
  }

  if (!top21) {
    try {
      testName = await getOwnerNameTestnet(ownerName);
      // If there are any other statements here, add logs before and after them.
    } catch (error) {
      console.error(`Error in route: ${error.message}`);
      // your error handling code
    }
  }
  

  // Decide the base URL based on the top21 parameter
  const baseURL = top21 ? MAINNET_MISSINGBLOCK_URL : TESTNET_MISSINGBLOCK_URL;
  // For top21, use ownerName. For others, use targetName.
  const targetName = top21 ? ownerName : testName;

  // Construct the external URL with query parameters
  const externalURL = `${baseURL}/missing-blocks?ownerName=${encodeURIComponent(targetName)}&startDate=${startDate}&endDate=${endDate}`;

  try {
    // Make a GET request using axios
    const response = await axios.get(externalURL);
    const processedResponse = insertDummyDataIfEmpty(response.data);
    console.log( processedResponse)

    // Send the data received from the external URL back to the client
    //reply.send(response.data);
    reply.send(processedResponse);
  } catch (error) {
    console.error('Error calling external URL:', error);
    
    // Handle the error based on your needs (e.g., sending a custom error response)
    reply.status(500).send({
      success: false,
      error: {
        kind: "external_api",
        message: "Failed to fetch data from external source.",
      },
    });
  }
});



// Empty Blocks
fastify.get('/api/empty-blocks', async (req, reply) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Construct the external URL with query parameters
  const externalURL = `${MAINNET_MISSINGBLOCK_URL}/empty-blocks?startDate=${startDate}&endDate=${endDate}`;

  try {
    // Make a GET request using axios
    const response = await axios.get(externalURL);
    const data = response.data.data; // Access the nested data array

    // Use Promise.all with map to wait for all asynchronous calls to complete
    const updatedData = await Promise.all(data.map(async (item) => {
      const logoData = await getProducerLogoHandler(item.owner_name);
      return { ...item, logo: logoData.logo_svg };
    }));

    reply.send(updatedData);
  } catch (error) {
    console.error('Error calling external URL:', error);
    
    // Handle the error based on your needs (e.g., sending a custom error response)
    reply.status(500).send({
      success: false,
      error: {
        kind: "external_api",
        message: "Failed to fetch data from external source.",
      },
    });
  }
});

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


fastify.setNotFoundHandler((req, res) => {
  if (req.raw.url && req.raw.url.startsWith("/api")) {
    return res.status(404).send({
      success: false,
      error: {
        kind: "user_input",
        message: "Not Found",
      },
    });
  }
  res.status(200).sendFile("index.html");
});


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
