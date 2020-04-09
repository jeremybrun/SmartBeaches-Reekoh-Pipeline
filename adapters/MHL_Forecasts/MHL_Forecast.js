/* By achille.cadix@uts.edu.au / achille.cadix@gmail.com
 * and jeremy.brun@uts.edu.au / jeremy.brun@gmail.com
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/* Manly Hydraulic Laboratory Nearshore Wave FORECAST adapter for Reekoh v2.0
* Changlelog:
* v2.0 Forked from v2 readings
*/

'use strict';

const axios = require('axios');
const moment = require('moment');

function ExtractOneDayForecast(dataList,locationName,locationID,forecastDays){
  let measuredList=[]
  for (let i=1;i<dataList.length;i++) {
    if (dataList[i].Hsm){ //The goal of the first loop is to determine what is the last measured value, so we create an array containing all the objects that contains measurements and, we'll take the last element of this list. 
    // The algorithm is based on the one that fetches the measured data
      measuredList.push(dataList[i])
    }
  }
 let lastValue= measuredList.pop() // As the output of the API query is from oldest to latest, taking the last value of the list ensures that the most recent data will be selected
 let lastMeasuredTime=lastValue.Timestamp;
 let oneDayTime=moment.parseZone(lastMeasuredTime).add(forecastDays,'days').format("YYYY-MM-DDTHH:mm:ssZZ");//This line adds one day to the timestamp of the last measured value, so that it will search for the forecast one day ahead of the last measured value which is considered to be "present time"
 console.log(oneDayTime)
 for (let i=1;i<dataList.length;i++) {
    if (dataList[i].Timestamp===oneDayTime){ //We're interested by the values that includes measures
      let oneDayForecast=dataList[i];
      oneDayForecast.forecast_advance=forecastDays+"DAY";
      oneDayForecast.name=locationName;
      oneDayForecast.locationID=locationID;
      return(oneDayForecast)
    }
  }
}

exports.handle = function (data, logger) {
  let user=data.NWTT_forecast_Config.user;
  let password=data.NWTT_forecast_Config.password;
  let locationID=data.NWTT_forecast_Config.location
  let locationName=data.NWTT_forecast_Config.name
  let forecastDays= data.NWTT_forecast_Config.forecast_days
  let token= Promise.resolve(axios({ //The API call lets us get the token from the username and the password in order to get the API token for the next API call
      method:'get',
      url:'https://api.manly.hydraulics.works/api.php?page=authenticate&username='+user+'&password='+password
      }))
      .then().catch (err=>{logger.error(err)})
  logger.log(data)
  let lastValue = Promise.resolve(axios({
          method:'get',
          url:'http://forecast.waves.nsw.gov.au/api/v1/timeseries/'+locationID+'/forecast?username='+user+'&token='+token
        }))
            .then((response) => ExtractOneDayForecast(response.data,locationName,locationID,forecastDays)
          ).catch (err=>{logger.error(err)})
    return lastValue
};