import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const WAKUNODE_IMAGE = process.env.WAKUNODE_IMAGE || "wakuorg/nwaku:v0.33.1";

async function main() {
  try {
    await execAsync(`docker inspect ${WAKUNODE_IMAGE}`);
    console.log(`Using local image ${WAKUNODE_IMAGE}`);
  } catch (error) {
    console.log(`Pulling image ${WAKUNODE_IMAGE}`);
    await execAsync(`docker pull ${WAKUNODE_IMAGE}`);
    console.log("Image pulled");
  }

  const mochaArgs = [
    "mocha",
    "--require",
    "ts-node/register",
    "--project",
    "./tsconfig.dev.json",
    ...process.argv.slice(2)
  ];

  // Run mocha tests
  const mocha = spawn("npx", mochaArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "test"
    }
  });

  mocha.on("error", (error) => {
    console.log(`Error running mocha tests: ${error.message}`);
    process.exit(1);
  });

  mocha.on("exit", (code) => {
    console.log(`Mocha tests exited with code ${code}`);
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
