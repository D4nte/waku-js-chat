import { HealthStatus, LightNode, Protocols } from "@waku/interfaces";
import { createLightNode } from "@waku/sdk";
import { expect } from "chai";

import {
  afterEachCustom,
  runMultipleNodes,
  ServiceNode,
  ServiceNodesFleet
} from "../../src";

import {
  messagePayload,
  TestDecoder,
  TestEncoder,
  TestShardInfo
} from "./utils";

describe("Node Health Status Matrix Tests", function () {
  let waku: LightNode;
  let serviceNodes: ServiceNode[];

  afterEachCustom(this, async function () {
    if (waku) {
      await waku.stop();
    }
    if (serviceNodes) {
      await Promise.all(serviceNodes.map((node) => node.stop()));
    }
  });

  const peerCounts = [0, 1, 2, 3];

  peerCounts.forEach((lightPushPeers) => {
    peerCounts.forEach((filterPeers) => {
      const expectedHealth = getExpectedNodeHealth(lightPushPeers, filterPeers);
      it(`LightPush: ${lightPushPeers} peers, Filter: ${filterPeers} peers - Expected: ${expectedHealth}`, async function () {
        this.timeout(10_000);

        [waku, serviceNodes] = await setupTestEnvironment(
          this.ctx,
          lightPushPeers,
          filterPeers
        );

        if (lightPushPeers > 0) {
          await waku.lightPush.send(TestEncoder, messagePayload, {
            forceUseAllPeers: true
          });
        }

        if (filterPeers > 0) {
          await waku.filter.subscribe([TestDecoder], () => {});
        }

        const lightPushHealth = waku.health.getProtocolStatus(
          Protocols.LightPush
        );
        const filterHealth = waku.health.getProtocolStatus(Protocols.Filter);

        expect(lightPushHealth?.status).to.equal(
          getExpectedProtocolStatus(lightPushPeers)
        );
        expect(filterHealth?.status).to.equal(
          getExpectedProtocolStatus(filterPeers)
        );

        const nodeHealth = waku.health.getHealthStatus();
        expect(nodeHealth).to.equal(expectedHealth);
      });
    });
  });
});

function getExpectedProtocolStatus(peerCount: number): HealthStatus {
  if (peerCount === 0) return HealthStatus.Unhealthy;
  if (peerCount === 1) return HealthStatus.MinimallyHealthy;
  return HealthStatus.SufficientlyHealthy;
}

function getExpectedNodeHealth(
  lightPushPeers: number,
  filterPeers: number
): HealthStatus {
  if (lightPushPeers === 0 || filterPeers === 0) {
    return HealthStatus.Unhealthy;
  } else if (lightPushPeers === 1 || filterPeers === 1) {
    return HealthStatus.MinimallyHealthy;
  } else {
    return HealthStatus.SufficientlyHealthy;
  }
}

async function runNodeWithProtocols(
  lightPush: boolean,
  filter: boolean
): Promise<ServiceNode> {
  const serviceNode = new ServiceNode(`node-${Date.now()}`);
  await serviceNode.start({
    lightpush: lightPush,
    filter: filter,
    relay: true
  });
  return serviceNode;
}

async function setupTestEnvironment(
  context: Mocha.Context,
  lightPushPeers: number,
  filterPeers: number
): Promise<[LightNode, ServiceNode[]]> {
  let commonPeers: number;
  if (lightPushPeers === 0 || filterPeers === 0) {
    commonPeers = Math.max(lightPushPeers, filterPeers);
  } else {
    commonPeers = Math.min(lightPushPeers, filterPeers);
  }

  let waku: LightNode;
  const serviceNodes: ServiceNode[] = [];
  let serviceNodesFleet: ServiceNodesFleet;

  if (commonPeers > 0) {
    [serviceNodesFleet, waku] = await runMultipleNodes(
      context,
      TestShardInfo,
      { filter: true, lightpush: true },
      undefined,
      commonPeers
    );
    serviceNodes.push(...serviceNodesFleet.nodes);
  } else {
    waku = await createLightNode({ shardInfo: TestShardInfo });
  }

  // Create additional LightPush nodes if needed
  for (let i = commonPeers; i < lightPushPeers; i++) {
    const node = await runNodeWithProtocols(true, false);
    serviceNodes.push(node);
    await waku.dial(await node.getMultiaddrWithId());
  }

  // Create additional Filter nodes if needed
  for (let i = commonPeers; i < filterPeers; i++) {
    const node = await runNodeWithProtocols(false, true);
    serviceNodes.push(node);
    await waku.dial(await node.getMultiaddrWithId());
  }

  return [waku, serviceNodes];
}
