import { exec } from "child_process";
import { setTimeout } from "timers";
import { promisify } from "util";

import { SEPOLIA_RPC_URL } from "./constants.js";
import { ServiceNode } from "./lib/index.js";

const execAsync = promisify(exec);

const WAKUNODE_IMAGE = process.env.WAKUNODE_IMAGE || "wakuorg/nwaku:v0.33.1";
const containerName = "rln_tree";

async function syncRlnTree() {
  try {
    await execAsync(`docker inspect ${WAKUNODE_IMAGE}`);
    console.log(`Using local image ${WAKUNODE_IMAGE}`);
  } catch (error) {
    console.log(`Pulling image ${WAKUNODE_IMAGE}`);
    await execAsync(`docker pull ${WAKUNODE_IMAGE}`);
    console.log("Image pulled");
  }

  const nwaku = new ServiceNode(containerName);
  await nwaku.start(
    {
      store: false,
      lightpush: false,
      relay: true,
      filter: false,
      rest: true,
      clusterId: 1,
      rlnRelayEthClientAddress: SEPOLIA_RPC_URL
    },
    { retries: 3 }
  );
  let healthy = false;
  while (!healthy) {
    healthy = await nwaku.healthy();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await execAsync(
    `docker cp ${nwaku.containerName}:/rln_tree.db /tmp/rln_tree.db`
  );
  await nwaku.stop();
}

syncRlnTree()
  .then(() => {
    console.log("Synced RLN tree");
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Error syncing RLN tree: ${err}`);
    process.exit(1);
  });
