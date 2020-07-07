#!/usr/bin/env node

const util = require("util");
const path = require("path");
const http = require("http");

const sqlite3 = require("sqlite3");
const staticAlias = require("node-static-alias");

// ************************************

const DB_PATH = path.join(__dirname, "my.db");
const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

var delay = util.promisify(setTimeout);

var myDB = new sqlite3.Database(DB_PATH);
var SQL3 = {
  run(...args) {
    return new Promise(function c(resolve, reject) {
      myDB.run(...args, function onResult(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  get: util.promisify(myDB.get.bind(myDB)),
  all: util.promisify(myDB.all.bind(myDB)),
  exec: util.promisify(myDB.exec.bind(myDB)),
};

var fileServer = new staticAlias.Server(WEB_PATH, {
  cache: 100,
  serverInfo: "Node Workshop: ex5",
  alias: [
    {
      match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
      serve: "index.html",
      force: true,
    },
    {
      match: /^\/js\/.+$/,
      serve: "<% absPath %>",
      force: true,
    },
    {
      match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
      serve: function onMatch(params) {
        return `${params.basename}.html`;
      },
    },
    {
      match: /[^]/,
      serve: "404.html",
    },
  ],
});

var httpserv = http.createServer(handleRequest);

main();

// ************************************

function main() {
  httpserv.listen(HTTP_PORT);
  console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

async function handleRequest(req, res) {
  if (/\/get-records\b/.test(req.url)) {
    await delay(1000);

    let records = (await getAllRecords()) || [];

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "max-age: 0, no-cache",
    });
    res.end(JSON.stringify(records));
  } else {
    fileServer.serve(req, res);
  }
}

// *************************

async function getAllRecords() {
  var result = await SQL3.all(
    `
		SELECT
			Something.data AS "something",
			Other.data AS "other"
		FROM
			Something
			JOIN Other ON (Something.otherID = Other.id)
		ORDER BY
			Other.id DESC, Something.data
		`
  );

  return result;
}
