/* By jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

'use strict'
const Moment = require('moment');
/*
function convertUnixFormatDateToUTCFormatDate(unixDateStr) {
    let unixDate = Date.parse(unixDateStr);
    return Moment(unixDate).format('YYYY-MM-DDTHH:mm:ss.SSS');
}
*/

function convertUnixFormatDateIntToUTCFormatDate(unixDateInt) {
    let unixDate = new Date(unixDateInt);
    return Moment(unixDate).format('YYYY-MM-DDTHH:mm:ss.SSS');
}

/*
function ConvertTimestampToUnixEpochMs(timestamp) {
        let parsedTimestamp = Date.parse(timestamp);
        if (parsedTimestamp)
          return parsedTimestamp;
        else {
          logger.error("Failed to parse provided timestamp, return Date.now() instead")
          return new Date.now();
        }
    }
*/


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

  //port
  if (!data.hasOwnProperty("port"))
  {
    logger.error('port field missing from provided data')
    throw new Error('port field missing from provided data');
  }
  message.port = data.port


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


  if (!data.hasOwnProperty("ts"))
    throw new Error('ts field missing from provided data');
  message.network_metadata = {}
  message.network_metadata.timestamp_utc = data.ts;
  message.network_metadata.timestamp_unixEpoch_ms = convertUnixFormatDateIntToUTCFormatDate(data.ts);
  message.network_metadata.source = "NNNCo" ;



  if (!data.hasOwnProperty("deviceInfo"))
    throw new Error('deviceInfo field missing from provided data');

  //rkhDeviceInfo
  message.rkhDeviceInfo = data.deviceInfo

  //network_metadata
  if (!data.hasOwnProperty("network") && !data.network.hasOwnProperty("loraWan"))
    throw new Error('network/loraWan structure missing from provided data');
  
  //network_metadata/RSSI
  if (!data.network.loraWan.hasOwnProperty("rssi"))
    throw new Error('rssi field missing from provided data');
  message.network_metadata.RSSI = data.network.loraWan.rssi

  //network_metadata/SNR
  if (!data.network.loraWan.hasOwnProperty("snr"))
    throw new Error('snr field missing from provided data');
  message.network_metadata.SNR = data.network.loraWan.snr;

  

/*
  let device_info_promise = FindRkDeviceInfo("70b3d57050002fe4");

  let message_promise = device_info_promise.then( device_info => {
    message.rkhDeviceInfo = device_info;
    return message;
  })
*/


  return Promise.resolve(message)
}
