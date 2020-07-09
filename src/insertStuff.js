#!/usr/bin/env node
// insert stuff
const init = require("./database/initDB");
const yargs = require("yargs");
let f;
const { SQL3 } = init();

main().catch(console.error);

// ************************************
async function main() {
  yargs.command({
    command: "add",
    describe: "add your name to the db.",
    builder: {
      name: {
        describe: "your name",
        demandOption: true,
        type: "string",
      },
    },
    handler(argv) {
      f = async () => {
        const other = argv.name;
        const something = Math.trunc(Math.random() * 1e9);
        const otherID = await getOrInsertOtherID(other);
        if (otherID != null) {
          let inserted = await insertSomething(something, otherID);
          if (inserted) {
            let records = await getAllRecords();
            console.table(records);
            return;
          }
          error("Oops!");
        }
      };
      f();
    },
  });
}
// ***********

const getOrInsertOtherID = async (other) => {
  let result = await SQL3.get(
    `
		SELECT
			id
		FROM
			Other
		WHERE
			data = ?
		`,
    other
  );

  if (result != null) {
    return result.id;
  } else {
    result = await SQL3.run(
      `
			INSERT INTO
				Other
			(data)
			VALUES
				(?)
			`,
      other
    );

    if (result != null && result.changes > 0) {
      return result.lastID;
    }
  }
};

const insertSomething = async (something, otherID) => {
  const result = await SQL3.run(
    `
		INSERT INTO
			Something
			(otherID, data)
		VALUES
			(?, ?)
		`,
    otherID,
    something
  );

  if (result != null && result.changes > 0) {
    return true;
  }
};

const getAllRecords = async () => {
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
		`
  );

  return result;
};

const error = (err) => {
  if (err) {
    console.error(err.toString());
    console.log("");
  }
};
