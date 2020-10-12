#!/usr/bin/env node
/*
      a script for converting pdf files to audio.
      to test :
      ./covert.js file --name=./files/lorem.pdf --convert
*/

const yargs = require('yargs');
const CAF = require('caf');
const { log, BASEPATH } = require('./Utils');

const timeout = CAF.timeout(2000, 'Took too long to convert.');
const flags = {
  name: {
    describe: 'specify file name',
    demandOption: true,
    type: 'string',
  },
};

/** ************************** DEFINITION ****************************** */
async function main() {
  yargs.command({
    command: 'audio',
    describe: 'convert the piped file.',
    builder: {
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
