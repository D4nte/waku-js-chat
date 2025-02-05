import { IWaku } from "@waku/interfaces";
import { Logger } from "@waku/utils";
import pRetry from "p-retry";

import { ServiceNode } from "../lib/service_node.js";

const log = new Logger("test:teardown");

const TEARDOWN_TIMEOUT = 10000; // 10 seconds timeout for teardown

export async function tearDownNodes(
  nwakuNodes: ServiceNode | ServiceNode[],
  wakuNodes: IWaku | IWaku[]
): Promise<void> {
  const nNodes = Array.isArray(nwakuNodes) ? nwakuNodes : [nwakuNodes];
  const wNodes = Array.isArray(wakuNodes) ? wakuNodes : [wakuNodes];

  try {
    // Use Promise.race to implement timeout
    const teardownPromise = Promise.all([
      ...nNodes.map(async (nwaku) => {
        if (nwaku) {
          await pRetry(
            async () => {
              try {
                await nwaku.stop();
              } catch (error) {
                log.error("Nwaku failed to stop:", error);
                throw error;
              }
            },
            { retries: 3, minTimeout: 1000 }
          );
        }
      }),
      ...wNodes.map(async (waku) => {
        if (waku) {
          try {
            await waku.stop();
          } catch (error) {
            log.error("Waku failed to stop:", error);
          }
        }
      })
    ]);

    await Promise.race([
      teardownPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Teardown timeout")),
          TEARDOWN_TIMEOUT
        )
      )
    ]);
  } catch (error) {
    log.error("Teardown failed:", error);
    // Force process cleanup if needed
    process.exit(1);
  }
}
