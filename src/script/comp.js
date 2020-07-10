#!/usr/bin/env node
/*    
      a script for compressing txt files or process them.
      to test : 
      ./comp.js file --name=./files/lorem.txt --compress
      ./comp.js file --name=./outfiles/out.txt.gz --uncompress
*/

/*************************** INIT ******************************/
const fs = require("fs");
const path = require("path");
const CAF = require("caf");
const yargs = require("yargs");
let { log, processFile, BASEPATH } = require("./CompUtils");
var timeout = CAF.timeout(1000, "Took too long.");
const flags = {
  compress: {
    describe: "process then create a compressed file.",
    type: "boolean",
  },
  uncompress: {
    describe: "uncompress a gziped file.",
    type: "boolean",
  },
  out: {
    describe: "process then print to screen.",
    type: "boolean",
  },
};
let f;

/**************************** EXECUTION *****************************/
main().catch((err) => {
  log(err);
});

/************************** DEFINITION *******************************/
async function main() {
  processFile = CAF(processFile);

  yargs.command({
    command: "in",
    describe: "process the piped file.",
    builder: {
      ...flags,
    },
    handler(argv) {
      f = async () => {
        await processFile(timeout, process.stdin, argv);
        log("compledted!");
      };
      f();
    },
  });
  yargs.command({
    command: "file",
    describe: "process the named file.",
    builder: {
      name: {
        describe: "specify file name",
        demandOption: true,
        type: "string",
      },
      ...flags,
    },
    handler(argv) {
      f = async () => {
        let filePath = path.join(BASEPATH, argv.name);
        let stream = fs.createReadStream(filePath);
        await processFile(timeout, stream, argv);
        log("compledted!");
      };
      f();
    },
  });
  yargs.parse();
}
