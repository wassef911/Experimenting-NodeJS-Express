#!/usr/bin/env node

const util = require("util");
const path = require("path");
const http = require("http");

const express = require("express");
const sqlite3 = require("sqlite3");

// ************************************

const DB_PATH = path.join(__dirname, "my.db");
const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

var delay = util.promisify(setTimeout);
const app = express();
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

var httpserv = http.createServer(app);

main();

// ************************************

function main() {
  defineRoutes();
  httpserv.listen(HTTP_PORT);
  console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}
function defineRoutes() {
  app.get("/get-records", async (req, res) => {
    let records = await getAllRecords();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });
    res.end(JSON.stringify(records));
  });
  app.use((req, res, next) => {
    if (/^\/(?:index\/?)?(?:[?#].*$)?$/.test(req.url)) {
      req.url = "/index.html";
    } else if (/^\/js\/.+$/.test(req.url)) {
      next();
      return;
    } else if (/^\/(?:[\w\d]+)(?:[\/?#].*$)?$/.test(req.url)) {
      let [, basename] = req.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);
      req.url = `${basename}.html`;
    }

    next();
  });
  app.use(
    express.static(WEB_PATH, {
      maxAge: 99,
      setHeaders: (res) => {
        res.setHeader("Server", "911,s");
      },
    })
  );
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
