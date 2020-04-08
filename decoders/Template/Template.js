/* By jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

'use strict'
const Moment = require('moment');

/*
// This function turns data_mapping_field in data_field value base on the values found in the provided intermediateFormat
function GenerateThingspeakDataFields(thingspeakinfo, intermediateFormat, logger) {
  // Empty field counter
  let number_of_empty_fields = 0;

  // looking for all 8 ThingSpeak data fields 
  for (var i=1; i<=8; i++) {
    if (thingspeakinfo.hasOwnProperty("data_mapping_field"+i))
    {
      if (intermediateFormat.hasOwnProperty(thingspeakinfo["data_mapping_field"+i]))
      {
        // Push the data field value in
        thingspeakinfo["data_field"+i] = intermediateFormat[thingspeakinfo["data_mapping_field"+i]];
      }
      else
      {
        // Value not found in intermediateFormat
        // This is a problem but we do not want to throw an exception here for fear of loosing data
        logger.error("no entry named "+thingspeakinfo["data_mapping_field"+i]+" in provided intermediateFormat");
      }
    }
    else
    {
      //thingspeakinfo["data_field"+i] = null;
      number_of_empty_fields++;
    }
  }

  if (number_of_empty_fields === 8)
  {
  // at least one field is needed otherwise we log an error 
  // we do not want to throw as other element may be valid
    logger.error("no telemetry found to send to ThingSpeak for apikey "+thingspeakinfo.apikey);
    // This is a problem but we do not want to throw an exception here for fear of loosing data
  }
  return thingspeakinfo;
}

function GenerateDatalakeDataFields(datalakeinfo, intermediateFormat, logger) {
  let rawData = {};
  for (const field of datalakeinfo.telemetrylist) {
    if (intermediateFormat.hasOwnProperty(field)) 
      rawData[field] = intermediateFormat[field];
    else
      logger.error("no entry named "+field+" in provided intermediateFormat");
  }
  return rawData;
}

function GenerateDataFields(fieldselection, intermediateFormat, logger) {
  let rawData = {};
  for (const field of fieldselection) {
    if (intermediateFormat.hasOwnProperty(field)) 
      rawData[field] = intermediateFormat[field];
    else
      logger.error("no entry named "+field+" in provided intermediateFormat");
  }
  return rawData;
}
*/



// the function MUST be called "Decode" takes the TTN and raw Buffer
// usually extracted using 
// Buffer.from(data.payload_raw.data, 'hex')
function Decode(port, msg, logger) {
  var out = {};

// Add the decoding code here
  out.telemetry1 = 2056;
  out.vPanel = 12.9;

  return out;
}

// Put an example of the result from the docder function here
/*
Example Decoded Payload for SensorNode w/ 10HS
{
    "telemetry1": "2056",
    "vPanel": "12.9"
}
*/

// This function should throw an exception if decoded data does not looks like expected
function Verify(decoded, logger)
{
  if (!decoded.hasOwnProperty("telemetry1")) {
    logger.error('telemetry1 field missing in decoded data');
    throw new Error('telemetry1 field missing in decoded data');
  }  
  return true;
}

// This function MUST return true if the received data is compatible with the ecoder
// and it MUST retrurn false if it is not
function IsDataCompatible(data, logger)
{
  if (data.rkhDeviceInfo.metadata.type.toLowerCase() !== 'templatedevicetype')
  {
      logger.error("type is NOT TemplateDeviceType")
      return false;    
  }
  return true
}

// This functions fills the formatted data object from the decoded infomration
function FillFormattedData(decoded, formatted_data)
//function FillFormattedData(decoded, formatted_data, rkdevinfo, logger)
{

  formatted_data["telemetry/telemetry1"] = decoded.telemetry1/10;
  formatted_data["internal/solarVoltage_V"] = decoded.vPanel;
  return true; 
}

/*
function CreateThingSpeakInfoArray(data, formatted_data, logger)
{
  let thingspeakinfo_array = [];

  if (data.rkhDeviceInfo && data.rkhDeviceInfo.metadata.hasOwnProperty("thingSpeak"))
  {
    if (data.rkhDeviceInfo.metadata.thingSpeak.thingspeak_TEMPLATEDEVICE_key) {
      let thingspeakinfo = {};
      thingspeakinfo.apikey = data.rkhDeviceInfo.metadata.thingSpeak.thingspeak_TEMPLATEDEVICE_key;
      thingspeakinfo.data_mapping_field1 = "telemetry/telemetry1";
      thingspeakinfo.data_mapping_field6 = "internal/solarVoltage_V";
      thingspeakinfo.data_mapping_field7 = "network/lorawan_snr";
      thingspeakinfo.data_mapping_field8 = "network/lorawan_rssi";

      thingspeakinfo = GenerateThingspeakDataFields(thingspeakinfo, formatted_data, logger);

      thingspeakinfo_array.push(thingspeakinfo);
    }
  }
  return thingspeakinfo_array;
}
*/
 
function CreateDataLakeInfo(data, formatted_data, logger)
{
  let datalakeinfo = {};

  datalakeinfo.data = {};
  datalakeinfo.data.stream_id = `TEMPLATE-DECODER-ONE-${formatted_data["global/deviceId"].replace(/-/g, '')}`.toUpperCase();
  datalakeinfo.data.timestamp = formatted_data["global/timestamp_unixEpoch_ms"];

  datalakeinfo.info = {};
  datalakeinfo.data.type = "TEMPLATE.DECODER";
  datalakeinfo.data.type_version = 1;

  datalakeinfo.info.telemetrylist = [
    "telemetry/telemetry1",
    "internal/solarVoltage_V",
    "network/lorawan_snr",
    "network/lorawan_rssi"
    ];    

  datalakeinfo.data.raw_data = GenerateDatalakeDataFields(datalakeinfo.info, formatted_data, logger);

  return datalakeinfo;
}

function CreateUrbanPulseInfo(data, formatted_data, logger)
{
  // fake code to avoid the unused variable issue in Reekoh
  if (data && formatted_data && logger)
    return null;

  let urbanpulseinfo = {};
  urbanpulseinfo.endpoint = "FAKE_UP_STREAM";
  urbanpulseinfo.data = {};
  
  urbanpulseinfo.telemetrylist = [
    "global/timestamp_utc",
    "global/timestamp_unixEpoch_ms",
    "global/deviceId",
    "network/lorawan_snr",
    "network/lorawan_rssi"
    ];

  urbanpulseinfo.data = GenerateDataFields(urbanpulseinfo.telemetrylist, formatted_data, logger);

  //urbanpulseinfo.data = GenerateDataFields(urbanpulseinfo.telemetrylist, formatted_data, logger);
  //return urbanpulseinfo;

  return null;
}




/**** DO NOT MODIFY THE FUNCTIONS FOR A PARTICULAR ****
***** DECODER FROM HERE ALL THE BELOW FUNCTIONS    ****
***** MUST STAY COMMON TO ALL DECODERS             ****/

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


/**
 * Handler function that will process the data and return a result.
 *
 * @param {Object} data - Data to be processed.
 * @param {Object} logger - Can be used for any logging purposes.
 * @param {Function} logger.log - Use to log anything i.e. logger.log(Object | String)
 */
exports.handle = function (data, logger) {

  // Check we are handling the correct data
  if (!IsDataCompatible(data, logger))
    return Promise.resolve("Incompatible Data"); 
  
  // Log input data
  //logger.log(data)
  
  // Prepare the outgoing message
  let message = {};
  message.formatted_data = {}

  // Add Device ID
  message.formatted_data["global/deviceId"] = data.rkhDeviceInfo._id;

  // Add TimeStamp
  message.formatted_data["global/timestamp_utc"] = convertUnixFormatDateToUTCFormatDate(data.metadata.time);
  message.formatted_data["global/timestamp_unixEpoch_ms"] = ConvertTimestampToUnixEpochMs(message.formatted_data["global/timestamp_utc"]);

  // Add TTN network metadata
  ExtractAndAddTTNNetworkInfo(data, message.formatted_data);

  // Decode the raw payload, somehow the decagon does encode some data in the provided port as well
  let decoded = Decode(data.port, Buffer.from(data.payload_raw.data, 'hex'), logger);
  
  // Sanity checks, making sure all expected data is present
  // for intermediateFormat transformation
  if (!Verify(decoded, logger))
    return;

  // Formatted Data (including telemetry)
  if (!FillFormattedData(decoded, message.formatted_data))
    return Promise.resolve("FillFormattedData Error"); 
 
  // Outputs generation
  message.output = {};

  // ThingSpeak output information
  let thingspeakinfo = CreateThingSpeakInfoArray(data, message.formatted_data, logger);
  if (thingspeakinfo)
    message.output.thingspeak = thingspeakinfo;

  // DataLake output information
  let datalakeinfo = CreateDataLakeInfo(data, message.formatted_data, logger);
  if (datalakeinfo)
    message.output.datalake = datalakeinfo;

  // DataLake output information
  let urbanpulseinfo = CreateUrbanPulseInfo(data, message.formatted_data, logger);
  if (urbanpulseinfo)
    message.output.urbanpulse = urbanpulseinfo;

  //logger.log(message)
  //logger.log(JSON.stringify(message, null, 4))

   // forward testing flag
   if (data.testing)
     message.output.testing = true;

  return Promise.resolve(message)
}
