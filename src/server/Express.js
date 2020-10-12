#!/usr/bin/env node
// serve http without express

/** ************************* INIT ***************************** */
const path = require('path');
const http = require('http');
const express = require('express');

const initDatabase = require('../database/initDB');
const getAllRecords = require('../script/insertStuff');
// ************************************

const WEB_PATH = path.join(__dirname, 'web');
const HTTP_PORT = 8039;

const app = express();

const httpserv = http.createServer(app);

/** ************************* DEFINITION  ***************************** */

function defineRoutes() {
  app.get('/get-records', async (req, res) => {
    const SQL3 = await initDatabase();
    const records = await getAllRecords(SQL3);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    res.end(JSON.stringify(records));
  });
  app.use((req, res, next) => {
    if (/^\/(?:index\/?)?(?:[?#].*$)?$/.test(req.url)) {
      req.url = '/index.html';
    } else if (/^\/js\/.+$/.test(req.url)) {
      next();
      return;
    } else if (/^\/(?:[\w\d]+)(?:[\/?#].*$)?$/.test(req.url)) {
      const [, basename] = req.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);
      req.url = `${basename}.html`;
    }

    next();
  });
  app.use(
    express.static(WEB_PATH, {
      maxAge: 99,
      setHeaders: (res) => {
        res.setHeader('Server', '911,s');
      },
    }),
  );
}

function main() {
  defineRoutes();
  httpserv.listen(HTTP_PORT);
  console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

/** ************************** EXECUTION **************************** */
main();
