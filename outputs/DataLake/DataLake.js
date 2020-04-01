/* By jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

'use strict'

const axios = require('axios');
let testing = false;

// ThingSpeak Output for Reekoh v2.0

/* Incoming data MUST be in this format
"output": {
        "datalake": {
            "data": {
                "stream_id": "TTN-NETVOXR712-TTN_ID-00137A10000020E0",
                "timestamp": 1581382140456,
                "type": "NETVOXR712",
                "type_version": 1,
                "raw_data": {
                    "telemetry/air_temperature_C": 23.12,
                    "telemetry/air_humidity_pc": 65.16,
                    "internal/batteryVoltage_V": 3.1,
                    "network/lorawan_snr": -7.5,
                    "network/lorawan_rssi": -121
                }
            },
            "info": {
                "telemetrylist": [
                    "telemetry/air_temperature_C",
                    "telemetry/air_humidity_pc",
                    "internal/batteryVoltage_V",
                    "network/lorawan_snr",
                    "network/lorawan_rssi"
                ]
            }
          }
*/

function hasRequiredFields(data) {
    if (!data.stream_id)
        throw new Error('Missing stream_id');
    if (!data.type)
        throw new Error('Missing type');
    if (!data.type_version)
        throw new Error('Missing type_version');
    if (!data.timestamp)
        throw new Error('Missing timestamp');
    if (!data.raw_data)
        throw new Error('Missing raw_data');
}

function hasCorrectType(data) {
    if (typeof data.stream_id !== 'string')
        throw new Error('Wrong stream_id data type, should be String');
    if (typeof data.type !== 'string')
        throw new Error('Wrong type data type, should be String');
    if (typeof data.type_version !== 'number')
        throw new Error('Wrong type_version data type, should be Number');
    if (typeof data.timestamp !== 'number')
        throw new Error('Wrong timestamp data type, should be Number');

    try {
        JSON.parse(JSON.stringify(data.raw_data));
    } catch (err) {
        throw new Error('Wrong raw_data dataType, should be JSON');
    }
}

//function convertToNenufar(datalakeinfo, raw_data) {
function convertToNenufar_v1(datalakeinfo, raw_data) {
// The Dalake Format version 1 is:
// https://utsrapido.atlassian.net/wiki/spaces/TUL/pages/698482751/Data+lake+format
/*
{
    "stream_id": String,
    "type": String,
    "type_version": Number,
    "timestamp": Number, //timestamp of measure stored as BigInt, not date of receiving
    "raw_data": Object //stored as string in the lake
    "metadata_type": String, 
    "metadata_type_version": Number
    "metadata": String,
    "protocol_version": Number
}
*/

    return {
        stream_id: datalakeinfo.stream_id.toUpperCase(),
        type: datalakeinfo.type.toUpperCase(),
        type_version: datalakeinfo.type_version,
        timestamp: datalakeinfo.timestamp,
        raw_data: datalakeinfo.raw_data,
        metadata_type: datalakeinfo.metadata_type || null,
        metadata_type_version: datalakeinfo.metadata_type_version || null,
        metadata: datalakeinfo.metadata || null,
        protocol_version: 1
    }
}

/**
 * Handler function that will process the data and return a result.
 *
 * @param {Object} data - Data to be processed.
 * @param {Object} logger - Can be used for any logging purposes.
 * @param {Function} logger.log - Use to log anything i.e. logger.log(Object | String)
 */
exports.handle = function (data, logger) {
  // TODO: Process the data here. You may return a value, or a Promise.

  // Sanity checks
  /* output block not needed for UrbanPulse
  if (!data.hasOwnProperty("output")) {
    // output MUST be present in the message
    throw new Error('output field missing from provided message');
  }
  */

    // Log input data
  //logger.log("DATALAKE INPUT:")
  //logger.log(JSON.stringify(data, null, 4))

  // Test Mode
  if (data.output.hasOwnProperty("testing") && data.output.testing === true) {
    testing = true;
  }

  if (!data.hasOwnProperty("output")) {
    // telemetry MUST be present in the message
    throw new Error('output block missing from missing from provided message');
  }

  if (!data.output.hasOwnProperty("datalake")) {
    // No Datalake info in the outputs: Nothing to do
    logger.error("No DataLake output")
    return Promise.resolve('NO DATALAKE OUTPUT')//'NO DATALAKE OUTPUT';
    //throw new Error('output/datalakeinfo block missing from missing from provided message');
  }


  hasRequiredFields(data.output.datalake.data);
  hasCorrectType(data.output.datalake.data);

  let message = convertToNenufar_v1(data.output.datalake.data);

  //logger.log(message)
  //logger.log(JSON.stringify(message, null, 4))


  // 
  return Promise.resolve(message)
}
