const Transform = require("stream").Transform;
const zlib = require("zlib");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

let BASEPATH = path.resolve(process.env.BASEPATH || __dirname);
let BASEOUTPATH = path.resolve(
  process.env.BASEOUTPATH || path.join(__dirname, "outfiles")
);
let OUTPATH = path.join(BASEOUTPATH, "out.txt");

/*************************** FUNCTIONS ******************************/
const log = (str) => {
  console.log(chalk.green.bold(str));
};

const streamComplete = (stream) => {
  return new Promise((res) => {
    stream.on("end", res);
  });
};

function* processFile(signal, inputStream, argv) {
  let stream = inputStream;
  let outStream;

  if (argv.uncompress) {
    let gunzip = zlib.createGunzip();
    stream = stream.pipe(gunzip);
  }

  var uppercase = new Transform({
    transform(chunk, encoding, done) {
      this.push(chunk.toString().toUpperCase());
      done();
    },
  });

  stream = stream.pipe(uppercase);

  if (argv.compress && !argv.out) {
    OUTPATH = `${OUTPATH}.gz`;
    let gzip = zlib.createGzip();
    stream = stream.pipe(gzip);
  }

  if (argv.out && !argv.compress) {
    outStream = process.stdout;
  } else {
    outStream = fs.createWriteStream(OUTPATH);
  }

  stream.pipe(outStream);

  // listen for cancelation to abort output
  signal.pr.catch(function onCancelation() {
    stream.unpipe(outStream);
    stream.destroy();
  });

  yield streamComplete(stream);
}

/*************************** EXPORT ******************************/
module.exports = { log, processFile, BASEPATH };
