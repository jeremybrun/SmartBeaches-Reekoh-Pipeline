var nnnco_adapter =  require('./adapters/NNNCo/NNNCo');

const fs = require('fs');

//Testing NNNCo Adapter
function Test_NNNCo() {
  let rawdata = fs.readFileSync('./adapters/NNNCo/input/ex_1.json');
  let data = JSON.parse(rawdata)
  res = nnnco_adapter.handle(data, console);
  res.then(tmp => console.log("RESULT:\n"+JSON.stringify(tmp, null, 4)))
}

Test_NNNCo();