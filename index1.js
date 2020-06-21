#!/usr/bin/env node
var getStdin = require("get-stdin");
var fs = require("fs");
var path = require("path");

var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
});

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

const processFile = (contents) => {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
  // could've used console.log but it comes with unneeded proccesing.
};

const BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  getStdin().then(processFile).catch(error);
} else if (args.file) {
  let filePath = path.join(BASE_PATH, args.file);
  fs.readFile(filePath, "utf-8", (err, contents) => {
    // used utf-8 encoding on the binary buffer returned from readFile
    if (err) {
      error(err.toString());
    } else {
      processFile(contents.toString());
    }
  });
} else {
  error("Incorrect usage bruh.", true);
}
