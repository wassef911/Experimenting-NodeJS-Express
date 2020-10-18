#!/usr/bin/env node
/*
      a script for converting pdf files to audio.
      to test :
     ./convert.js convert --path=./files/test.pdf --format=mp3
*/
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');
const CAF = require('caf');

const { log, BASEPATH, convertFile } = require('./Utils');

const timeout = CAF.timeout(2000, 'Took too long to convert.');
const flags = {
  path: {
    describe: 'specify file path.',
    demandOption: true,
    type: 'string',
  },
  format: {
    describe: 'specify the format.',
    demandOption: true,
    type: 'string',
  },
};
let f;

/** ************************** DEFINITION ****************************** */
async function main() {
  yargs.command({
    command: 'convert',
    describe: 'convert the piped file.',
    builder: {
      ...flags,
    },
    handler(argv) {
      f = async () => {
        const filePath = path.join(BASEPATH, argv.path);
        await convertFile(timeout, filePath, argv);
      };
      f();
    },
  });
  yargs.parse();
}

/** ************************** EXECUTION **************************** */
main().catch((err) => {
  log(err);
});
