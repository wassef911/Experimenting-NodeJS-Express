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

function convertFile(signal, fileName, argv) {
  if (argv.format === 'mp3') {
    new pdfreader.PdfReader().parseFileItems(fileName, (err, item) => {
      if (err) log(err);
      else if (!item) log('');
      else if (item.text) ToMP3(item.text);
    });
  }
  log('hi');
}

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
