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
  output["telemetry/wave_height"]=data.Hsm
  output["telemetry/peak_spectral_period"]=data.Tpm
  output["telemetry/peak_spectral_direction"]=data.Dirm
  return output
}

function CreateDatalakeInfo(data,formatted_data){
  let datalakeData={};
  datalakeData.type="Nearshore-Wave";
  datalakeData.stream_id="NEARSHORE-WAVE"+'-'+data.locationID+'-'+data.name.toUpperCase().replace(' ','-');
  datalakeData.type_version=1;
  datalakeData.timestamp=moment(data.Timestamp).format('X')*1000;
  datalakeData.raw_data=formatted_data;
  datalakeData.metadata_type = null;
  datalakeData.metadata_type_version = null;
  datalakeData.metadata = null;
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
  message.output.datalake.info.telemetryList=keyList
  message.output.datalake.data=CreateDatalakeInfo(data,message.formatted_data)
  if (!message){
    logger.log("message empty")
  }
  message.output.urbanpulse={endpoint:'NearShoreWave-'+data.name.replace(' ','-'),ata:message.formatted_data};
  message.output.urbanpulse.telemetryList=keyList;
  return Promise.resolve(message)
}