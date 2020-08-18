const fetch = require('node-fetch');


const testing = () => {
fetch('https://www.eos42.io/chains.json')
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

/*
const arr = ["/chains.json", "/wax.json", "/bp.json", "/test.json"];
let working=[], notWorking=[],
    find = url=> fetch('https://www.eos42.io')
    .then(res=> res.ok ? 
        working.push(res.url) && res : notWorking.push(res.url) && res);

Promise.all(arr.map(find))
.then(responses=>{
    console.log('woking', working, 'notWorking', notWorking);

});
*/