#!/usr/bin/env node

const util = require("util");
const fs = require("fs");
const path = require("path");
const Transform = require("stream").Transform;
const zlib = require("zlib");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
let OUT_FILE = path.join(BASE_PATH, "out.txt");

const printHelp = () => {
  /* i'll do my best to keep this updated, no promises tho' */
  console.log("script2 usage : ./script2 --arg ");
  console.log("");
  console.log("--help               print this help.");
  console.log("--file={FILENAME}    process the file.");
  console.log("--out                pipe output to a new file.");
  console.log("--compress           gzip the outputed file.");
  console.log("");
  console.log("cat {FILENAME} | ./script2.js --in  process the piped stream.");
  console.log("");
};

const error = (msg, includeHelp = false) => {
  console.log(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
};

const processFile = (inStream) => {
  let outStream = inStream;
  let upperStream = new Transform({
    transform(chunk, enc, next) {
      this.push(chunk.toString().toUpperCase());
      setTimeout(next, 400);
    },
  });
  outStream = outStream.pipe(upperStream);
  let targetStream;
  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUT_FILE = `${OUT_FILE}.gz`;
  }
  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUT_FILE);
  }
  outStream.pipe(targetStream);
};

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  processFile(process.stdin);
} else if (args.file) {
  let filePath = path.join(BASE_PATH, args.file);
  let stream = fs.createReadStream(filePath);
  processFile(stream);
} else {
  error("Incorrect usage bruh.", true);
}
