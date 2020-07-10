#!/usr/bin/env node
// define some SQLite3 database helpers
const util = require("util");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");
const DB_PATH = path.join(__dirname, "my.db");
const DB_SQL_PATH = path.join(__dirname, "mydb.sql");
let SQL3;

/*************************** INIT ******************************/
async function initDatabase() {
  const myDB = new sqlite3.Database(DB_PATH);
  SQL3 = {
    run(...args) {
      return new Promise(function c(resolve, reject) {
        myDB.run(...args, (err) => {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: util.promisify(myDB.get.bind(myDB)),
    all: util.promisify(myDB.all.bind(myDB)),
    exec: util.promisify(myDB.exec.bind(myDB)),
  };
  const initSQL = fs.readFileSync(DB_SQL_PATH, "utf-8");
  await SQL3.exec(initSQL);
  return SQL3;
}

module.exports = initDatabase;
