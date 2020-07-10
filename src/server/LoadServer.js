//load the server with 500 child procs

/*************************** INIT ******************************/
var util = require("util");
var childProc = require("child_process");

const HTTP_PORT = 8039;
const MAX_CHILDREN = 500;

var delay = util.promisify(setTimeout);

/**************************** EXECUTION *****************************/
main().catch(console.error);

/*************************** DEFINITION  ******************************/
async function main() {
  console.log(`Load testing http://localhost:${HTTP_PORT}...`);

  while (true) {
    process.stdout.write(`Sending ${MAX_CHILDREN} requests...`);

    let children = [];

    for (let i = 0; i < MAX_CHILDREN; i++) {
      children.push(childProc.spawn("node", ["childProc.js"]));
    }

    let resps = children.map((child) => {
      return new Promise((res) => {
        child.on("exit", (code) => {
          if (code === 0) res(true);
          res(false);
        });
      });
    });
    resps = await Promise.all(resps);

    if (resps.every(Boolean)) {
      console.log(" success!");
    } else {
      console.log(" failures.");
    }

    await delay(500);
  }
}
