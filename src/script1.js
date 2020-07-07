#!/usr/bin/env node

const util = require("util");
const fs = require("fs");
const path = require("path");
const Transform = require("stream").Transform;
const zlib = require("zlib");
const CAF = require("caf");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
let OUT_FILE = path.join(BASE_PATH, "out.txt");

const printHelp = () => {
  /* i'll do my best to keep this updated, no promises tho' */
  console.log("script3 usage : ./script3 --arg ");
  console.log("");
  console.log("--help               print this help.");
  console.log("--file={FILENAME}    process the file.");
  console.log("--out                pipe output to the screen.");
  console.log("--compress           gzip the outputed file.");
  console.log("");
  console.log("cat {FILENAME} | ./script3.js --in  process the piped stream.");
  console.log("");
};

const error = (msg, includeHelp = false) => {
  console.log(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
};

const streamComplete = (stream) => {
  return new Promise((res) => {
    stream.on("end", res);
  });
};

function* processFile(signal, inStream) {
  let outStream = inStream;
  let upperStream = new Transform({
    transform(chunk, enc, next) {
      this.push(chunk.toString().toUpperCase());
      setTimeout(next, 100);
    },
  });
  outStream = outStream.pipe(upperStream);
  let targetStream;
  if (args.compress && !args.out) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUT_FILE = `${OUT_FILE}.gz`;
  }
  if (args.out && !args.compress) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUT_FILE);
  }
  outStream.pipe(targetStream);

  signal.pr.catch(function f() {
    outStream.unpipe(targetStream);
    outStream.destroy();
  });
  yield streamComplete(outStream);
}

processFile = CAF(processFile);

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  let tooLong = CAF.timeout(15, "Sorry it took too long bruh !");
  processFile(tooLong, process.stdin);
} else if (args.file) {
  let filePath = path.join(BASE_PATH, args.file);
  let stream = fs.createReadStream(filePath);
  let tooLong = CAF.timeout(15, "Sorry it took too long bruh !");
  processFile(tooLong, stream)
    .then(() => {
      console.log("Completed");
    })
    .catch(error);
} else {
  error("Incorrect usage bruh.", true);
}
