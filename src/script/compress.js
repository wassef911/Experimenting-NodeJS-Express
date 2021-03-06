#!/usr/bin/env node
/*
      a script for compressing txt files or process them.
      to test :
      ./compress.js file --name=./files/lorem.txt --compress
      ./compress.js file --name=./outfiles/out.txt.gz --uncompress
*/

/** ************************* INIT ***************************** */
const fs = require('fs');
const path = require('path');
const CAF = require('caf');
const yargs = require('yargs');
const { log, BASEPATH } = require('./Utils');
let { compressFile } = require('./Utils');

const timeout = CAF.timeout(1000, 'Took too long to compress.');

const flags = {
  compress: {
    describe: 'process then create a compressed file.',
    type: 'boolean',
  },
  uncompress: {
    describe: 'uncompress a gziped file.',
    type: 'boolean',
  },
  out: {
    describe: 'process then print to screen.',
    type: 'boolean',
  },
};
let f;

/** ************************ DEFINITION ****************************** */
async function main() {
  compressFile = CAF(compressFile);

  yargs.command({
    command: 'in',
    describe: 'process the piped file.',
    builder: {
      ...flags,
    },
    handler(argv) {
      f = async () => {
        await compressFile(timeout, process.stdin, argv);
        log('compledted!');
      };
      f();
    },
  });
  yargs.command({
    command: 'file',
    describe: 'process the named file.',
    builder: {
      name: {
        describe: 'specify file name',
        demandOption: true,
        type: 'string',
      },
      ...flags,
    },
    handler(argv) {
      f = async () => {
        const filePath = path.join(BASEPATH, argv.name);
        const stream = fs.createReadStream(filePath);
        await compressFile(timeout, stream, argv);
        log('compledted!');
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
