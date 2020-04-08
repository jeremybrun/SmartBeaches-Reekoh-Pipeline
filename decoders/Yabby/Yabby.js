/* By jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/* SmartBeaches YABBY Decoder for NNNCO and TTN v3.1
* Changlelog:
* v3.1 added example of decoded data in comment
* v3.0 update output data model to datalake
*      bumped typeversion to 2
*      added changelog
*/

'use strict'
//const Moment = require('moment');

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
*/

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



// the function MUST be called "Decode" takes the TTN and raw Buffer
// usually extracted using 
// Buffer.from(data.payload_raw.data, 'hex')
function Decode(port, msg, logger)
{
  if (port !== 1)
    logger.error("Expected port is 1, but provided port is " + port)

  let bytes = msg;
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  if (bytes == null)
    return null;
  
  if (port === 1)
  {
    if (bytes.length !== 11)
      return null;
  
    decoded.type = "position";
    
    decoded.latitudeDeg = bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
    if (decoded.latitudeDeg >= 0x80000000)
      decoded.latitudeDeg -= 0x100000000;
    decoded.latitudeDeg /= 1e7;
      
    decoded.longitudeDeg = bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;
    if (decoded.longitudeDeg >= 0x80000000)
      decoded.longitudeDeg -= 0x100000000;
    decoded.longitudeDeg /= 1e7;
      
    decoded.inTrip = ((bytes[8] & 0x1) !== 0) ? true : false;
    decoded.fixFailed = ((bytes[8] & 0x2) !== 0) ? true : false;
    decoded.manDown = ((bytes[8] & 0x4) !== 0) ? true : false;
    
    decoded.headingDeg = (bytes[9] & 0x7) * 45;
    decoded.speedKmph = (bytes[9] >> 3) * 5;
    
    decoded.batV = bytes[10] * 0.025;
  }
  else if (port === 2)
  {
    if (bytes.length !== 3)
        return null;
      
    decoded.type = "downlink ack";
    
    decoded.sequence = (bytes[0] & 0x7F);
    decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
  }
  else if (port === 3)
  {
    if (bytes.length !== 11)
      return null;
      
    decoded.type = "stats";
   
    decoded.initialBatV    = (((bytes[0] & 0xF) !== 0) ? (4.0 + (bytes[0] & 0xF) * 0.100) : null);
    decoded.txCount        =  32 * ((bytes[0] >> 4) + (bytes[1]  & 0x7F) *  16);
    decoded.tripCount      =  32 * ((bytes[1] >> 7) + (bytes[2]  & 0xFF) *   2 + (bytes[3]  & 0x0F) * 512);
    decoded.gpsSuccesses   =  32 * ((bytes[3] >> 4) + (bytes[4]  & 0x3F) *  16);
    decoded.gpsFails       =  32 * ((bytes[4] >> 6) + (bytes[5]  & 0x3F) *   4);
    decoded.aveGpsFixS     =   1 * ((bytes[5] >> 6) + (bytes[6]  & 0x7F) *   4);
    decoded.aveGpsFailS    =   1 * ((bytes[6] >> 7) + (bytes[7]  & 0xFF) *   2);
    decoded.aveGpsFreshenS =   1 * ((bytes[7] >> 8) + (bytes[8]  & 0xFF) *   1);
    decoded.wakeupsPerTrip =   1 * ((bytes[8] >> 8) + (bytes[9]  & 0x7F) *   1);
    decoded.uptimeWeeks    =   1 * ((bytes[9] >> 7) + (bytes[10] & 0xFF) *   2);
	}

    return decoded;
}

// Put an example of the result from the docder function here
/*
Example Decoded Payload for Yabby
{
  type: 'position',
  latitudeDeg: -33.01384,
  longitudeDeg: 151.7198489,
  inTrip: false,
  fixFailed: true,
  manDown: true,
  headingDeg: 180,
  speedKmph: 0,
  batV: 4.025
}
*/

// This function should throw an exception if decoded data does not looks like expected
function Verify(decoded, logger)
{
  if (!decoded.hasOwnProperty("type")) {
    logger.error('type field missing in decoded data');
    throw new Error('type field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("latitudeDeg")) {
    logger.error('latitudeDeg field missing in decoded data');
    throw new Error('latitudeDeg field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("longitudeDeg")) {
    logger.error('longitudeDeg field missing in decoded data');
    throw new Error('longitudeDeg field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("inTrip")) {
    logger.error('inTrip field missing in decoded data');
    throw new Error('inTrip field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("fixFailed")) {
    logger.error('fixFailed field missing in decoded data');
    throw new Error('fixFailed field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("headingDeg")) {
    logger.error('headingDeg field missing in decoded data');
    throw new Error('headingDeg field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("speedKmph")) {
    logger.error('speedKmph field missing in decoded data');
    throw new Error('speedKmph field missing in decoded data');
  }  
  if (!decoded.hasOwnProperty("speedKmph")) {
    logger.error('speedKmph field missing in decoded data');
    throw new Error('speedKmph field missing in decoded data');
  }  
  return true;
}

// This function MUST return true if the received data is compatible with the ecoder
// and it MUST retrurn false if it is not
function IsDataCompatible(data, logger)
{
  if (data.rkhDeviceInfo.metadata.hasOwnProperty("type"))
  {
    if (data.rkhDeviceInfo.metadata.type.toLowerCase() !== 'yabby')
    {
      logger.error("type is NOT TemplateDeviceType")
      return false;    
    }
    return true;
  }
  else if (data.rkhDeviceInfo.metadata.name.toLowerCase().search("yab") === 0)
    return true;
  return false;
}

// This functions fills the formatted data object from the decoded infomration
function FillFormattedData(decoded, formatted_data)
//function FillFormattedData(decoded, formatted_data, rkdevinfo, logger)
{

  formatted_data["telemetry/asset_latitude_deg"] = decoded.latitudeDeg;
  formatted_data["telemetry/asset_longitude_deg"] = decoded.longitudeDeg;
  formatted_data["telemetry/asset_heading_deg"] = decoded.headingDeg;
  formatted_data["telemetry/asset_speed_kmph"] = decoded.speedKmph;
  formatted_data["internal/batteryVoltage_V"] = decoded.batV;
  formatted_data["internal/Error_GPSfixFailed_"] = decoded.fixFailed;
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
  datalakeinfo.data.stream_id = `${data.network_metadata.source.toUpperCase()}-YABBY-EUID-${formatted_data["global/deviceId"].replace(/-/g, '')}`.toUpperCase();
  datalakeinfo.data.timestamp = formatted_data["global/timestamp_unixEpoch_ms"];

  datalakeinfo.info = {};
  datalakeinfo.data.type = "YABBY";
  datalakeinfo.data.type_version = 2;

  datalakeinfo.info.telemetrylist = [
    "telemetry/asset_latitude_deg",
    "telemetry/asset_longitude_deg",
    "telemetry/asset_heading_deg",
    "telemetry/asset_speed_kmph",
    "internal/batteryVoltage_V",
    "internal/Error_GPSfixFailed_",
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
    "telemetry/asset_latitude_deg",
    "telemetry/asset_longitude_deg",
    "telemetry/asset_heading_deg",
    "telemetry/asset_speed_kmph",
    "internal/batteryVoltage_V",
    "internal/Error_GPSfixFailed_",
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
/*
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
*/

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
  message.formatted_data["global/timestamp_utc"] = data.network_metadata.timestamp_utc;
  message.formatted_data["global/timestamp_unixEpoch_ms"] = data.network_metadata.timestamp_unixEpoch_ms;

  // Add TTN network metadata
  message.formatted_data["network/lorawan_snr"] = data.network_metadata.SNR;
  message.formatted_data["network/lorawan_rssi"] = data.network_metadata.RSSI;

  // Decode the raw payload, somehow the decagon does encode some data in the provided port as well
  let decoded = Decode(data.port, Buffer.from(data.buffer.data, 'hex'), logger);

  //logger.log(decoded)
  
  // Sanity checks, making sure all expected data is present
  // for intermediateFormat transformation
  if (!Verify(decoded, logger))
    return;

  // Formatted Data (including telemetry)
  if (!FillFormattedData(decoded, message.formatted_data))
    return Promise.resolve("FillFormattedData Error"); 
 
  // Outputs generation
  message.output = {};

  /*
  // ThingSpeak output information
  let thingspeakinfo = CreateThingSpeakInfoArray(data, message.formatted_data, logger);
  if (thingspeakinfo)
    message.output.thingspeak = thingspeakinfo;
  */

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
