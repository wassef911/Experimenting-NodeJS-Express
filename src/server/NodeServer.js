#!/usr/bin/env node
//serve http without express

/*************************** INIT ******************************/
const util = require("util");
const path = require("path");
const http = require("http");
const staticAlias = require("node-static-alias");

const initDatabase = require("../database/initDB");
const getAllRecords = require("../script/insertStuff");

const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

var delay = util.promisify(setTimeout);

var fileServer = new staticAlias.Server(WEB_PATH, {
  cache: 100,
  serverInfo: "NodeJs server",
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

/**************************** EXECUTION *****************************/
main();

/*************************** DEFINITION  ******************************/
function main() {
  httpserv.listen(HTTP_PORT);
  console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

async function handleRequest(req, res) {
  if (/\/get-records\b/.test(req.url)) {
    await delay(1000);
    const SQL3 = await initDatabase();
    let records = (await getAllRecords(SQL3)) || [];

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "max-age: 100, no-cache",
    });
    res.end(JSON.stringify(records));
  } else {
    fileServer.serve(req, res);
  }
}
