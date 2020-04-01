class ModuleTester {
  constructor(module, testdatafilecontent) {
    this.module = module;
    this.testdata = JSON.parse(testdatafilecontent);
  }

  async run() {
    let res = await this.module.handle(this.testdata, console);
    return res;
  }

  async create_golden_vector() {
        let res = await this.run();
        if (typeof res === 'string')
          return res;
        let golden_vector = JSON.stringify(res, null, 4);
        return golden_vector;
  }

}

class PipeTester {
    constructor(inputloader, outputmodule, goldenoutputfilecontent)
    {
        this.inputloader = inputloader;
        this.output = outputmodule;
        this.goldenvector = goldenoutputfilecontent;
    }

    async run()
    {
        let inputres = await this.inputloader.run();
        //console.log("INPUTRESULT:\n"+JSON.stringify(inputres, null, 4));
        let outputloader = new ModuleTester(this.output, JSON.stringify(inputres));
        let outputres = await outputloader.run();
        //console.log("OUTPUTRES:\n"+JSON.stringify(outputres, null, 4));

        let testable_outputres = "";

        if (typeof outputres === 'undefined')
        {
          return "TEST FAILED: Output is undefined"
        }
        else if (typeof outputres === 'string')
        {
          testable_outputres = outputres;
        }
        else if (typeof outputres === 'object')
        {
          testable_outputres = JSON.stringify(outputres, null, 4);
        }
        else {
          return "TEST FAILED: Output is of unhadled type "+typeof outputres
        }

        if (this.goldenvector.toString().trim() === testable_outputres.toString().trim())
            return "TEST PASSED";
        return "TEST FAILED:\nexpected: "+this.goldenvector+"\nreceived: "+testable_outputres;

    }

    async create_golden_vector() {
        let inputres = await this.inputloader.run();
        //console.log("INPUTRESULT:\n"+JSON.stringify(inputres, null, 4));
        let outputloader = new ModuleTester(this.output, JSON.stringify(inputres));
        let outputres = await outputloader.run();
        //console.log("OUTPUTRES:\n"+JSON.stringify(outputres, null, 4));
        if (typeof outputres === 'string')
          return outputres;
        let golden_vector = JSON.stringify(outputres, null, 4);
        return golden_vector;
    }

}


class InputToOutputTester {
    constructor(inputmodule, outputmodule, testdatafilecontent, goldenoutputfilecontent)
    {
        this.input = inputmodule;
        this.output = outputmodule;
        this.testdata = JSON.parse(testdatafilecontent);
        this.goldenvector = goldenoutputfilecontent;
    }

    async run()
    {
        let inputres = await this.input.handle(this.testdata, console);
        //console.log("INPUTRESULT:\n"+JSON.stringify(inputres, null, 4));
        let outputres = await this.output.handle(inputres, console);
        //console.log("OUTPUTRES:\n"+JSON.stringify(outputres, null, 4));

        if (this.goldenvector.toString().trim() === outputres.toString().trim())
            return "TEST PASSED";
        return "TEST FAILED:\nexpected: "+this.goldenvector+"\nreceived: "+outputres;

    }
}

module.exports = {
    PipeTester: PipeTester,
    ModuleTester: ModuleTester,
    InputToOutputTester: InputToOutputTester
}
