#!/usr/bin/env node
const { Transform } = require('stream');
const zlib = require('zlib');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const pdfreader = require('pdfreader');
const { ToMP3 } = require('./say');

const BASEPATH = path.resolve(process.env.BASEPATH || __dirname);
const BASE_OUT_PATH = path.resolve(
  process.env.BASEOUTPATH || path.join(__dirname, 'outfiles'),
);
let OUTPATH = path.join(BASE_OUT_PATH, 'out.txt');
const OUTPATH_PDF = path.join(BASE_OUT_PATH, 'out.mp3');

/** ************************* FUNCTIONS ***************************** */
const log = (str) => {
  console.log(chalk.green.bold(str));
};

const streamComplete = (stream) => new Promise((res) => {
  stream.on('end', res);
});

const convertFile = async (signal, fileName, argv) => {
  if (argv.format === 'mp3') {
    await ToMP3('Freddie Mercury (born Farrokh Bulsara; 5 September 1946 – 24 November 1991)[2] was a British singer, songwriter, record producer, and lead vocalist of the rock band Queen. Regarded as one of the greatest lead singers in the history of rock music, he was known for his flamboyant stage persona and four-octave vocal range. Mercury defied the conventions of a rock frontman, with his highly theatrical style influencing the artistic direction of Queen.');
    new pdfreader.PdfReader().parseFileItems(fileName, (err, item) => {
      if (err) log(err);
      else if (!item) log('');
      else if (item.text) {
        console.log('hi');
      }
    });
  } else { console.log('convert format not supported'); }
};

function* compressFile(signal, inputStream, argv) {
  let stream = inputStream;
  let outStream;

  if (argv.uncompress) {
    const gunzip = zlib.createGunzip();
    stream = stream.pipe(gunzip);
  }

  const uppercase = new Transform({
    transform(chunk, encoding, done) {
      this.push(chunk.toString().toUpperCase());
      done();
    },
  });

  stream = stream.pipe(uppercase);

  if (argv.compress && !argv.out) {
    OUTPATH = `${OUTPATH}.gz`;
    const gzip = zlib.createGzip();
    stream = stream.pipe(gzip);
  }

  if (argv.out && !argv.compress) {
    outStream = process.stdout;
  } else {
    outStream = fs.createWriteStream(OUTPATH);
  }

  stream.pipe(outStream);

  // listen for cancelation to abort output
  signal.pr.catch(() => {
    stream.unpipe(outStream);
    stream.destroy();
  });

  yield streamComplete(stream);
}

/** ************************* EXPORT ***************************** */
module.exports = {
  log, compressFile, convertFile, BASEPATH,
};
