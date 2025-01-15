import { Multiaddr } from "@multiformats/multiaddr";
import { EConnectionStateEvents, LightNode, Protocols } from "@waku/interfaces";
import { createRelayNode } from "@waku/relay";
import { createLightNode } from "@waku/sdk";
import { expect } from "chai";

import {
  afterEachCustom,
  beforeEachCustom,
  DefaultTestShardInfo,
  delay,
  NOISE_KEY_1
} from "../../src/index.js";
import {
  makeLogFileName,
  ServiceNode,
  tearDownNodes
} from "../../src/index.js";

const TEST_TIMEOUT = 30_000;

describe("Connection state", function () {
  this.timeout(TEST_TIMEOUT);
  let waku: LightNode;

  let nwaku1: ServiceNode;
  let nwaku2: ServiceNode;
  let nwaku1PeerId: Multiaddr;
  let nwaku2PeerId: Multiaddr;

  beforeEachCustom(this, async () => {
    try {
      waku = await createLightNode({ networkConfig: DefaultTestShardInfo });
    } catch (error) {
      console.error(error);
    }
    nwaku1 = new ServiceNode(makeLogFileName(this.ctx) + "1");
    nwaku2 = new ServiceNode(makeLogFileName(this.ctx) + "2");
    await nwaku1.start({ filter: true });
    await nwaku2.start({ filter: true });
    nwaku1PeerId = await nwaku1.getMultiaddrWithId();
    nwaku2PeerId = await nwaku2.getMultiaddrWithId();
  });

  afterEachCustom(this, async () => {
    await tearDownNodes([nwaku1, nwaku2], waku);
  });

  it("should emit `waku:online` event only when first peer is connected", async function () {
    let eventCount = 0;
    const connectionStatus = new Promise<boolean>((resolve) => {
      waku.connectionManager.addEventListener(
        EConnectionStateEvents.CONNECTION_STATUS,
        ({ detail: status }) => {
          eventCount++;
          resolve(status);
        }
      );
    });

    await waku.dial(nwaku1PeerId, [Protocols.Filter]);
    await delay(400);
    expect(await connectionStatus).to.eq(true);
    expect(eventCount).to.be.eq(1);

    await waku.dial(nwaku2PeerId, [Protocols.Filter]);
    await delay(400);
    expect(eventCount).to.be.eq(1);
  });

  it("should emit `waku:offline` event only when all peers disconnect", async function () {
    console.log("dial 1");
    await waku.dial(nwaku1PeerId, [Protocols.Filter]);
    console.log("dial 1 success");
    await waku.dial(nwaku2PeerId, [Protocols.Filter]);

    let eventCount = 0;
    const connectionStatus = new Promise<boolean>((resolve) => {
      waku.connectionManager.addEventListener(
        EConnectionStateEvents.CONNECTION_STATUS,
        ({ detail: status }) => {
          eventCount++;
          resolve(status);
        }
      );
    });

    await nwaku1.stop();
    await delay(400);
    expect(eventCount).to.be.eq(0);

    await nwaku2.stop();
    expect(await connectionStatus).to.eq(false);
    expect(eventCount).to.be.eq(1);
  });

  it("`waku:online` between 2 js-waku relay nodes", async function () {
    const waku1 = await createRelayNode({
      staticNoiseKey: NOISE_KEY_1,
      networkConfig: DefaultTestShardInfo
    });
    const waku2 = await createRelayNode({
      libp2p: { addresses: { listen: ["/ip4/0.0.0.0/tcp/0/ws"] } },
      networkConfig: DefaultTestShardInfo
    });

    let eventCount1 = 0;
    const connectionStatus1 = new Promise<boolean>((resolve) => {
      waku1.connectionManager.addEventListener(
        EConnectionStateEvents.CONNECTION_STATUS,
        ({ detail: status }) => {
          eventCount1++;
          resolve(status);
        }
      );
    });

    let eventCount2 = 0;
    const connectionStatus2 = new Promise<boolean>((resolve) => {
      waku2.connectionManager.addEventListener(
        EConnectionStateEvents.CONNECTION_STATUS,
        ({ detail: status }) => {
          eventCount2++;
          resolve(status);
        }
      );
    });

    await waku1.libp2p.peerStore.merge(waku2.libp2p.peerId, {
      multiaddrs: waku2.libp2p.getMultiaddrs()
    });
    await Promise.all([waku1.dial(waku2.libp2p.peerId)]);
    await delay(400);

    expect(await connectionStatus1).to.eq(true);
    expect(await connectionStatus2).to.eq(true);
    expect(eventCount1).to.be.eq(1);
    expect(eventCount2).to.be.eq(1);
  });

  it("isConnected should return true after first peer connects", async function () {
    expect(waku.isConnected()).to.be.false;
    await waku.dial(nwaku1PeerId, [Protocols.Filter]);
    await delay(400);
    expect(waku.isConnected()).to.be.true;
  });

  it("isConnected should return false after all peers disconnect", async function () {
    await waku.dial(nwaku1PeerId, [Protocols.Filter]);
    await waku.dial(nwaku2PeerId, [Protocols.Filter]);
    await delay(250);
    expect(waku.isConnected()).to.be.true;

    await waku.libp2p.hangUp(nwaku1PeerId);
    expect(waku.isConnected()).to.be.true;
    await waku.libp2p.hangUp(nwaku2PeerId);
    expect(waku.isConnected()).to.be.false;
  });

  it("isConnected return false after peer stops", async function () {
    expect(waku.isConnected()).to.be.false;
    await waku.dial(nwaku1PeerId, [Protocols.Filter]);
    await delay(400);
    expect(waku.isConnected()).to.be.true;

    await nwaku1.stop();
    await delay(400);
    expect(waku.isConnected()).to.be.false;
  });

  it("isConnected between 2 js-waku relay nodes", async function () {
    const waku1 = await createRelayNode({
      staticNoiseKey: NOISE_KEY_1
    });
    const waku2 = await createRelayNode({
      libp2p: { addresses: { listen: ["/ip4/0.0.0.0/tcp/0/ws"] } }
    });
    await waku1.libp2p.peerStore.merge(waku2.libp2p.peerId, {
      multiaddrs: waku2.libp2p.getMultiaddrs()
    });
    await Promise.all([waku1.dial(waku2.libp2p.peerId)]);
    await delay(400);
    expect(waku1.isConnected()).to.be.true;
    expect(waku2.isConnected()).to.be.true;
  });
});
