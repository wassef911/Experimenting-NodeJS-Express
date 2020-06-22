#!/usr/bin/env node
// var getStdin = require("get-stdin");
var fs = require("fs");
var path = require("path");

var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
});

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

const printHelp = () => {
  /* i'll do my best to keep this updated, no promises tho' */
  console.log("index1 usage : ");
  console.log("");
  console.log("--help               print this help");
  console.log("--file={FILENAME}    process the file");
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
  let targetStream = process.stdout;
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
