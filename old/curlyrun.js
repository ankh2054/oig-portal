/**
 * Copyright (c) Jonathan Cardoso Machado. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Example showing how one could do a simple request using the `curlx` async fn
 */
const querystring = require('querystring')
const { curly } = require('node-libcurl');

const curlyrun = async (url) => {
  try {
    // there are many ways to use the curly.* functions
    let response = null
    // 1. Calling directly, which will default to a GET
    response = await curly(url)
    //console.log(response.statusCode, response.headers, response.data)
    if ( response.headers[0]['access-control-allow-origin'] == "*" ) {
      console.log(response.headers[0]['access-control-allow-origin'])
    }
    // Get all headers
    console.log(response.headers)
    // Extract HTTP version
    console.log(response.headers[0]['result']['version'])
  } catch (error) {
    console.error(`Error: ${error.message} - Code: ${error.code}`)
  }
}


exports.curlyrun  = curlyrun;