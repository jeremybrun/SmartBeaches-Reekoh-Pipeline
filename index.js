var nnnco_adapter =  require('./adapters/NNNCo/NNNCo');
var ttn_adapter =  require('./adapters/TTN/TTN');

const fs = require('fs');

//Testing NNNCo Adapter
function Test_NNNCo() {
  let rawdata = fs.readFileSync('./adapters/NNNCo/input/ex_1.json');
  let data = JSON.parse(rawdata)
  res = nnnco_adapter.handle(data, console);
  res.then(tmp => console.log("RESULT:\n"+JSON.stringify(tmp, null, 4)))
}

function Test_TTN() {
  let rawdata = fs.readFileSync('./adapters/TTN/input.json');
  let data = JSON.parse(rawdata)
  res = ttn_adapter.handle(data, console);
  res.then(tmp => console.log("RESULT:\n"+JSON.stringify(tmp, null, 4)))
}

async function TestOutputModule(modulename, testfilename)
{
  return TestModule(modulename, "outputs", testfilename);
}

async function TestAdapterModule(modulename, testfilename)
{
  return TestModule(modulename, "adapters", testfilename);
}

async function TestDecoderModule(modulename, testfilename)
{
  return TestModule(modulename, "decoders", testfilename);
}


async function TestModule(modulename, basepath, testfilename)
{
  var pipelinetester= require('./testers/PipelineTester');
  let base_directory_name = "./"
  let input_directory_name = "./"+basepath+"/"+modulename;

  var inputmodule = require(input_directory_name+"/"+modulename);
  const path = require('path');
  const promisify = require('util').promisify
  const readdirp = promisify(fs.readdir);
  const writefilep = promisify(fs.writeFile);

  let files  = await readdirp(input_directory_name);
  
    for (let f of files) {

      if (!testfilename || testfilename === f)
      {
        //console.log("testfilename: " + testfilename)
        let fullPath = path.join(input_directory_name, f);

        if (f.indexOf("package.json") >= 0)
        {
          console.log("SKIPPING FILE " + f);
        }
        else if (f.length - f.indexOf(".json") === 5)
        {
          console.log("PROCESSING FILE " + f);
          let testdata = fs.readFileSync(fullPath);
          let input_module_tester = new pipelinetester.ModuleTester(inputmodule, testdata);
          return await input_module_tester.run();
        }
        else
        {
          console.log("SKIPPING FILE " + f);
        }
      }
    }  
}

/*
async function TestDecoderModule(modulename, testfilename)
{
  var pipelinetester= require('./testers/PipelineTester');
  let base_directory_name = "./"
  let input_directory_name = "./decoders/"+modulename;

  var inputmodule = require(input_directory_name+"/"+modulename);
  const path = require('path');
  const promisify = require('util').promisify
  const readdirp = promisify(fs.readdir);
  const writefilep = promisify(fs.writeFile);

  let files  = await readdirp(input_directory_name);
  
    for (let f of files) {

      if (!testfilename || testfilename === f)
      {
        //console.log("testfilename: " + testfilename)
        let fullPath = path.join(input_directory_name, f);

        if (f.indexOf("package.json") >= 0)
        {
          console.log("SKIPPING FILE " + f);
        }
        else if (f.length - f.indexOf(".json") === 5)
        {
          console.log("PROCESSING FILE " + f);
          let testdata = fs.readFileSync(fullPath);
          let input_module_tester = new pipelinetester.ModuleTester(inputmodule, testdata);
          return await input_module_tester.run();
        }
        else
        {
          console.log("SKIPPING FILE " + f);
        }
      }
    }  
}
*/



const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

//Test_NNNCo();
//Test_TTN();


TestDecoderModule("Yabby").then(tmp => {
//TestDecoderModule("EMS", "ems_AirQ_data.json").then(tmp => {
//TestDecoderModule("EMS").then(tmp => {

  

//TestOutputModule("ThingSpeak","from_ems_airqual_01.json").then(tmp => {
//TestOutputModule("DataLake","thingspeak_4_data.json").then(tmp => {
//TestOutputModule("UrbanPulse","thingspeak_4_data.json").then(tmp => {
//TestOutputModule("ThingSpeak").then(tmp => {
//TestOutputModule("DataLake").then(tmp => {
//TestOutputModule("UrbanPulse").then(tmp => {
//TestOutputModule("DataLake", "datalake_2_data.json").then(tmp => {
    console.log("RESULT:\n"+JSON.stringify(tmp, getCircularReplacer(), 4))})
