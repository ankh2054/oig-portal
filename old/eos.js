// EOSJS version 2 used
const { JsonRpc, RpcError } = require('eosjs');
const fetch = require('node-fetch'); 


const rpc = new JsonRpc('https://waxapi.sentnl.io', { fetch });

function fetchwaxjson(tempurl){
    fetch(tempurl)
    .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
        return response.json();
        } else {
        throw Error(response.statusText);
        }
    })
    .then((jsonRes) => {
        return jsonRes['chains']['1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4']
      }).catch((error) => {
        // Handle the error
        console.log(error);
    });
}



// Get table function 
const eostable = async (code,scope,table) => {
try {
    const results = await rpc.get_table_rows({
        json: true,               // Get the response as json
        code: code,      // Contract that we target
        scope: scope,     // Account that owns the data
        table: table,        // Table name
        limit: 50,                // Maximum number of rows that we want to get
        reverse: false,           // Optional: Get reversed data
        show_payer: false         // Optional: Show ram payer
    });
    if ( scope == 'eosio') {
        // Access each BP info
        var bptemp = results['rows']
        // use regex to check for .wax 
        var reduced = bptemp.reduce(function(filtered, bptemp) {
            if (bptemp.owner !== 'eosio' || bptemp.owner !== "wax") {
               var someNewValue = { owner: bptemp.owner, url: bptemp.url }
               filtered.push(someNewValue);
            }
            return filtered;
          }, []);
        // Function that maps over each array and returns a new one.
        /*
        const bpowner = bptemp.map(bp => {
            const container = {};
            container.owner = bp.owner 
            container.url = bp.url
            return container
        })*/
        // Now 
        console.dir(reduced);

    }
    if ( scope == 'delphioracle') {
        console.dir(results);
    }
    
} catch (e) {
    console.log('\nCaught exception: ' + e);
    if (e instanceof RpcError)
        console.log(JSON.stringify(e.json, null, 2));
    }
}



exports.eostable = eostable ;

// save this information to postgresql
