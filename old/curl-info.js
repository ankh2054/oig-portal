const { Curl } = require('node-libcurl');

const curl = new Curl()
const url = 'http://httpbin.org/cookies/set/cookie1name/cookie1value'

curl.setOpt(Curl.option.URL, url)
curl.setOpt(Curl.option.FOLLOWLOCATION, true)
curl.setOpt(Curl.option.COOKIEFILE, '')
curl.perform()

curl.on('end', () => {
  for (const infoName in Curl.info) {
    if (Curl.info.hasOwnProperty(infoName) && infoName !== 'debug') {
      console.info(infoName, ': ', curl.getInfo(infoName))
    }
  }

  curl.close()
})

curl.on('error', curl.close.bind(curl))