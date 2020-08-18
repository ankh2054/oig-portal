const { Curl } = require('node-libcurl');

const curl = new Curl();


const curlmagic = (url) => {

curl.setOpt('URL', url);
curl.setOpt('FOLLOWLOCATION', true);

curl.on('end', function (statusCode, data, headers) {
  console.info(this.getInfo('HTTP_VERSION'));
  
  this.close();
});

curl.on('error', curl.close.bind(curl));
curl.perform();

}

curlmagic('http://www.google.com')