#!/usr/bin/env node
// insert stuff to db

/** ************************* INIT ***************************** */
const yargs = require('yargs');

let f;
const initDatabase = require('../database/initDB');

/** ************************** EXECUTION **************************** */
initDatabase()
  .then((SQL3) => {
    main(SQL3);
  })
  .catch(console.error);

/** ************************* DEFINITION  ***************************** */
async function main(SQL3) {
  yargs.command({
    command: 'add',
    describe: 'add your name to the db.',
    builder: {
      name: {
        describe: 'your name',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      f = async () => {
        const other = argv.name;
        const something = Math.trunc(Math.random() * 1e9);
        const otherID = await getOrInsertOtherID(SQL3, other);
        if (otherID != null) {
          const inserted = await insertSomething(SQL3, something, otherID);
          if (inserted) {
            const records = await getAllRecords(SQL3);
            console.table(records);
            return;
          }
          error('Oops!');
        }
      };
      f();
    },
  });
}

const getOrInsertOtherID = async (SQL3, other) => {
  let result = await SQL3.get(
    `
		SELECT
			id
		FROM
			Other
		WHERE
			data = ?
		`,
    other,
  );

  if (result != null) {
    return result.id;
  }
  result = await SQL3.run(
    `
			INSERT INTO
				Other
			(data)
			VALUES
				(?)
			`,
    other,
  );

  if (result != null && result.changes > 0) {
    return result.lastID;
  }
};

const insertSomething = async (SQL3, something, otherID) => {
  const result = await SQL3.run(
    `
		INSERT INTO
			Something
			(otherID, data)
		VALUES
			(?, ?)
		`,
    otherID,
    something,
  );

  if (result != null && result.changes > 0) {
    return true;
  }
};

const getAllRecords = async (SQL3) => {
  const result = await SQL3.all(
    `
		SELECT
			Something.data AS "something",
			Other.data AS "other"
		FROM
			Something
			JOIN Other ON (Something.otherID = Other.id)
		ORDER BY
			Other.id DESC, Something.data
		`,
  );

  return result;
};

const error = (err) => {
  if (err) {
    console.error(err.toString());
    console.log('');
  }
};

module.exports = getAllRecords;
