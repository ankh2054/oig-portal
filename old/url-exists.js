var http = require('http'),
    options = {method: 'HEAD', host: 's3.eu-central-1.wasabisys.com', port: 80, path: '/waxmainnet/snapshot-latest5.tar.gz'},
    req = http.request(options, function(r) {
        console.log(JSON.stringify(r.headers));
    });
req.end();



