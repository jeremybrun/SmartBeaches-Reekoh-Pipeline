/* By achille.cadix@uts.edu.au / achille.cadix@gmail.com
 * and jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/* Manly Hydraulic Laboratory Nearshore Wave converter for Reekoh v2.0
* Changlelog:
* v2.0 update output data model to datalake
*      bumped typeversion to 2
*      added changelog
*/

'use strict'
const moment=require('moment');

function Verify(decoded, logger)
{
  if (!decoded.hasOwnProperty("Timestamp")) {
    logger.error('Timestamp field missing in decoded data')
    throw new Error('Timestamp field missing in decoded data');
  }
  if (!decoded.hasOwnProperty("name")) {
    logger.error('name field missing in decoded data')
    throw new Error('name field missing in decoded data');
  }
  if (!decoded.hasOwnProperty("Hsm")) {
    logger.error('Hsm field missing in decoded data')
    throw new Error('Hsm field missing in decoded data');
  }
  if (!decoded.hasOwnProperty("Tpm")) {
    logger.error('Tpm field missing in decoded data')
    throw new Error('Tpm field missing in decoded data');
  }
  if (!decoded.hasOwnProperty("Dirm")) {
    logger.error('Dirm field missing in decoded data')
    throw new Error('Dirm field missing in decoded data');
  }
  return true;
}

function FormatData(data){
  let output={}
  output["telemetry/wave_height_m"]=data.Hsm
  output["telemetry/wave_peakSpectralPeriod_s"]=data.Tpm
  output["telemetry/wave_peakSpectralDirection_deg"]=data.Dirm
  return output
}

function CreateDatalakeInfo(data,formatted_data){
  let datalakeData={};
  datalakeData.type="Nearshore-Wave-Readings";
  datalakeData.stream_id="NEARSHOREWAVE-READING-"+data.locationID+'-'+data.name.toUpperCase().replace(' ','-');
  datalakeData.type_version=2;
  datalakeData.timestamp=moment(data.Timestamp).format('X')*1000;
  datalakeData.raw_data=formatted_data;
  datalakeData.metadata_type = null;
  datalakeData.metadata_type_version = null;
  datalakeData.metadata = null;
  datalakeData.protocol_version=1;
  return datalakeData
}

exports.handle = function (data, logger) {
  if (!Verify(data, logger))
    return;
  let message={};
  message.formatted_data = FormatData(data);
  let keyList=Object.keys(message.formatted_data);
  message.output={};
  message.output.datalake={data:{},info:{}};
  message.output.datalake.info.telemetryList=keyList;
  message.output.datalake.data=CreateDatalakeInfo(data,message.formatted_data);
  if (!message){
    logger.log("message empty")
  }
  message.output.urbanpulse={endpoint:'NearShoreWave-'+data.name.replace(' ','-'),ata:message.formatted_data};
  message.output.urbanpulse.telemetryList=keyList;
  return Promise.resolve(message)
}