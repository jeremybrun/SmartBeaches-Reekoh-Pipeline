/* By jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

'use strict'
const Moment = require('moment');
const axios = require('axios');

let testing = false;

function convertUnixFormatDateToUTCFormatDate(unixDateStr) {
    let unixDate = Date.parse(unixDateStr);
    return Moment(unixDate).format('YYYY-MM-DDTHH:mm:ss.SSS');
}

function ConvertTimestampToUnixEpochMs(timestamp) {
        let parsedTimestamp = Date.parse(timestamp);
        if (parsedTimestamp)
          return parsedTimestamp;
        else {
          //logger.error("Failed to parse provided timestamp, return Date.now() instead")
          return new Date.now();
        }
    }

function ExtractAndAddTTNNetworkInfo(data, target)
{
  	// Extracting the maximum SNR and RSSI from the gateway array
    let snr = -Infinity
    let rssi = -Infinity
    for (let gateway of data.metadata.gateways) {
      if (gateway.snr > snr) {
        snr = gateway.snr
      }
      if (gateway.rssi > rssi) {
        rssi = gateway.rssi
      }
    }
  
    target["network/ttn_snr"] = snr;
    target["network/ttn_rssi"] = rssi;
    return target;
}


async function RkAPI_GetToken(rkendpoint) {

var readlineSync = require('readline-sync');
let api_key = readlineSync.question('May I have your api_key? ');
  console.log("api_key=" + api_key)
let api_secret = readlineSync.question('May I have your api_secret? ');

  let rkbody4token = {
      "token": api_key,
      "secret": api_secret
  }

  let res = axios.post('https://'+rkendpoint+'/auth/token', rkbody4token);
  return res.then( value => {
    console.log("RkAPI_GetToken resolving: " +value.data.idToken)
    return value.data.idToken}
     );
}

function RkAPI_GetDeviceInfo(device_id, token, rkendpoint) {
  let body = {}
  let headers = { headers: {'Authorization': 'bearer ' + token}}

/*
.get(
      'https://'+rkendpoint+'/devices/' + device_euid,
      headers={'Authorization': 'bearer ' + rktoken})
  print("GetRkDevMetadata Status code:" + str(response.status_code))
  return response.json()*/


  let res = axios.get('https://'+rkendpoint+'/devices/'+device_id, headers);
  return res.then( value => {
    console.log("RkAPI_GetDeviceInfo resolving: " +value.data)
    return value.data;
  } );  
}

function FindRkDeviceInfo(device_id) {
  let rkendpoint = "api-au-e.reekoh.io";
  let rkendpoint2 = "requestbin.net/r/19fcmh91";


//  console.log("res=" + res);
//  rl.question('Provide Rk API secret', (answer) => {})
  //console.log(`Thank you for your valuable feedback: ${answer}`);
  let token_promise = RkAPI_GetToken(rkendpoint);
  let device_info_promise = token_promise.then( token => {
    return RkAPI_GetDeviceInfo(device_id, token, rkendpoint);
  })

  return device_info_promise;
  // using https://app.swaggerhub.com/apis-docs/R584/reekoh-rest-api/v1#/access

}


/**
 * Handler function that will process the data and return a result.
 *
 * @param {Object} data - Data to be processed.
 * @param {Object} logger - Can be used for any logging purposes.
 * @param {Function} logger.log - Use to log anything i.e. logger.log(Object | String)
 */
exports.handle = function (data, logger) {

  // Log input data
  //logger.log(data)

  // Create output message object
  let message = {}

  // Transcode from hex to buffer
  // Sanity check
  if (!data.hasOwnProperty("hexPayload"))
    throw new Error('hexPayload field missing from provided data');
  
  let hexdata = data.hexPayload;
  let buffer = Buffer.from(hexdata, 'hex');

  message.buffer = buffer;

  if (data.testing) {
    message.testing = true;
  }

  let device_info_promise = FindRkDeviceInfo("70b3d57050002fe4");

  let message_promise = device_info_promise.then( device_info => {
    message.rkhDeviceInfo = device_info;
    return message;
  })


  return Promise.resolve(message_promise)
}
