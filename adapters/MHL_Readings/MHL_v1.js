'use strict';

const axios = require('axios');


function ExtractLastValue(dataList,locationName,locationID){
  let measuredList=[]
  for (let i=1;i<dataList.length;i++) {
    if (dataList[i].Hsm){ //We're interested by the values that includes measures
      measuredList.push(dataList[i])
    }
  }
 let lastValue= measuredList.pop() // As the output of the API query is from oldest to latest, taking the last value of the list ensures that the most recent data will be selected
 lastValue.name=locationName
 lastValue.locationID=locationID
 return lastValue
}

exports.handle = function (data, logger) {
  let user=data.NWTTConfig.user;
  let password=data.NWTTConfig.password;
  let locationID=data.NWTTConfig.location
  let locationName=data.NWTTConfig.name
  let token= Promise.resolve(axios({ //The API call lets us get the token from the username and the password in order to get the API token for the next API call
      method:'get',
      url:'https://api.manly.hydraulics.works/api.php?page=authenticate&username='+user+'&password='+password
      }))
      .then().catch (err=>{logger.error(err)})
  let lastValue = Promise.resolve(axios({
          method:'get',
          url:'http://forecast.waves.nsw.gov.au/api/v1/timeseries/'+locationID+'/forecast?username='+user+'&token='+token
        }))
            .then((response) => ExtractLastValue(response.data,locationName,locationID)
          ).catch (err=>{logger.error(err)})
    return lastValue
};