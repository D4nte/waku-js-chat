import { bootstrap } from "@libp2p/bootstrap";
import type { PeerId } from "@libp2p/interface";
import {
  DecodedMessage,
  DefaultUserAgent,
  waitForRemotePeer
} from "@waku/core";
import type { LightNode, RelayNode, Waku } from "@waku/interfaces";
import { Protocols } from "@waku/interfaces";
import { generateSymmetricKey } from "@waku/message-encryption";
import {
  createDecoder,
  createEncoder
} from "@waku/message-encryption/symmetric";
import {
  createLightNode,
  createEncoder as createPlainEncoder
} from "@waku/sdk";
import { createRelayNode } from "@waku/sdk/relay";
import { bytesToUtf8, utf8ToBytes } from "@waku/utils/bytes";
import { expect } from "chai";

import {
  makeLogFileName,
  MOCHA_HOOK_MAX_TIMEOUT,
  NOISE_KEY_1,
  NOISE_KEY_2,
  ServiceNode,
  tearDownNodes,
  withGracefulTimeout
} from "../src/index.js";

const TestContentTopic = "/test/1/waku/utf8";

const TestEncoder = createPlainEncoder({ contentTopic: TestContentTopic });

describe("Waku Dial [node only]", function () {
  describe("Interop: ServiceNode", function () {
    let waku: LightNode;
    let nwaku: ServiceNode;

    this.afterEach(function (done) {
      this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
      const teardown: () => Promise<void> = async () => {
        await tearDownNodes(nwaku, waku);
      };
      withGracefulTimeout(teardown, 20000, done);
    });

    it("connects to nwaku", async function () {
      this.timeout(20_000);
      nwaku = new ServiceNode(makeLogFileName(this));
      await nwaku.start({
        filter: true,
        store: true,
        lightpush: true
      });
      const multiAddrWithId = await nwaku.getMultiaddrWithId();

      waku = await createLightNode({
        staticNoiseKey: NOISE_KEY_1
      });
      await waku.start();
      await waku.dial(multiAddrWithId);
      await waitForRemotePeer(waku, [
        Protocols.Store,
        Protocols.Filter,
        Protocols.LightPush
      ]);

      const nimPeerId = await nwaku.getPeerId();
      expect(await waku.libp2p.peerStore.has(nimPeerId)).to.be.true;
    });

    it("Does not throw an exception when node disconnects", async function () {
      this.timeout(20_000);

      process.on("unhandledRejection", (e) =>
        expect.fail("unhandledRejection", e)
      );
      process.on("uncaughtException", (e) =>
        expect.fail("uncaughtException", e)
      );

      nwaku = new ServiceNode(makeLogFileName(this));
      await nwaku.start({
        filter: true,
        store: true,
        lightpush: true
      });
      const multiAddrWithId = await nwaku.getMultiaddrWithId();

      waku = await createLightNode({
        staticNoiseKey: NOISE_KEY_1
      });
      await waku.start();
      await waku.dial(multiAddrWithId);

      await tearDownNodes(nwaku, []);
      await waku.lightPush?.send(TestEncoder, {
        payload: utf8ToBytes("hello world")
      });
    });
  });

  describe("Bootstrap", function () {
    let waku: LightNode;
    let nwaku: ServiceNode;

    this.afterEach(function (done) {
      this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
      const teardown: () => Promise<void> = async () => {
        await tearDownNodes(nwaku, waku);
      };
      withGracefulTimeout(teardown, 20000, done);
    });

    it("Passing an array", async function () {
      this.timeout(10_000);

      nwaku = new ServiceNode(makeLogFileName(this));
      await nwaku.start();
      const multiAddrWithId = await nwaku.getMultiaddrWithId();
      waku = await createLightNode({
        staticNoiseKey: NOISE_KEY_1,
        libp2p: {
          peerDiscovery: [bootstrap({ list: [multiAddrWithId.toString()] })]
        }
      });
      await waku.start();

      const connectedPeerID: PeerId = await new Promise((resolve) => {
        waku.libp2p.addEventListener("peer:connect", (evt) => {
          resolve(evt.detail);
        });
      });

      expect(connectedPeerID.toString()).to.eq(multiAddrWithId.getPeerId());
    });

    it("Using a function", async function () {
      this.timeout(10_000);

      nwaku = new ServiceNode(makeLogFileName(this));
      await nwaku.start();

      const nwakuMa = await nwaku.getMultiaddrWithId();

      waku = await createLightNode({
        staticNoiseKey: NOISE_KEY_1,
        libp2p: {
          peerDiscovery: [bootstrap({ list: [nwakuMa.toString()] })]
        }
      });
      await waku.start();

      const connectedPeerID: PeerId = await new Promise((resolve) => {
        waku.libp2p.addEventListener("peer:connect", (evt) => {
          resolve(evt.detail);
        });
      });

      const multiAddrWithId = await nwaku.getMultiaddrWithId();
      expect(connectedPeerID.toString()).to.eq(multiAddrWithId.getPeerId());
    });
  });
});

describe("Decryption Keys", () => {
  afterEach(function () {
    this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
    if (this.currentTest?.state === "failed") {
      console.log(`Test failed, log file name is ${makeLogFileName(this)}`);
    }
  });

  let waku1: RelayNode;
  let waku2: RelayNode;
  beforeEach(async function () {
    this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
    [waku1, waku2] = await Promise.all([
      createRelayNode({ staticNoiseKey: NOISE_KEY_1 }).then((waku) =>
        waku.start().then(() => waku)
      ),
      createRelayNode({
        staticNoiseKey: NOISE_KEY_2,
        libp2p: { addresses: { listen: ["/ip4/0.0.0.0/tcp/0/ws"] } }
      }).then((waku) => waku.start().then(() => waku))
    ]);

    await waku1.libp2p.peerStore.merge(waku2.libp2p.peerId, {
      multiaddrs: waku2.libp2p.getMultiaddrs()
    });
    await waku1.dial(waku2.libp2p.peerId);

    await Promise.all([
      waitForRemotePeer(waku1, [Protocols.Relay]),
      waitForRemotePeer(waku2, [Protocols.Relay])
    ]);
  });

  afterEach(async function () {
    this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
    await tearDownNodes([], [waku1, waku2]);
  });

  it("Used by Waku Relay", async function () {
    this.timeout(10000);

    const symKey = generateSymmetricKey();
    const decoder = createDecoder(TestContentTopic, symKey);

    const encoder = createEncoder({
      contentTopic: TestContentTopic,
      symKey
    });
    const messageText = "Message is encrypted";
    const messageTimestamp = new Date("1995-12-17T03:24:00");
    const message = {
      payload: utf8ToBytes(messageText),
      timestamp: messageTimestamp
    };

    const receivedMsgPromise: Promise<DecodedMessage> = new Promise(
      (resolve) => {
        void waku2.relay.subscribe([decoder], resolve);
      }
    );

    await waku1.relay.send(encoder, message);

    const receivedMsg = await receivedMsgPromise;

    expect(receivedMsg.contentTopic).to.eq(TestContentTopic);
    expect(bytesToUtf8(receivedMsg.payload)).to.eq(messageText);
    expect(receivedMsg.timestamp?.valueOf()).to.eq(messageTimestamp.valueOf());
  });
});

describe("User Agent", () => {
  let waku1: Waku;
  let waku2: Waku;

  afterEach(async function () {
    this.timeout(MOCHA_HOOK_MAX_TIMEOUT);
    await tearDownNodes([], [waku1, waku2]);
  });

  it("Sets default value correctly", async function () {
    this.timeout(20_000);

    const waku1UserAgent = "test-user-agent";

    [waku1, waku2] = await Promise.all([
      createRelayNode({
        staticNoiseKey: NOISE_KEY_1,
        userAgent: waku1UserAgent
      }).then((waku) => waku.start().then(() => waku)),
      createRelayNode({
        staticNoiseKey: NOISE_KEY_2,
        libp2p: { addresses: { listen: ["/ip4/0.0.0.0/tcp/0/ws"] } }
      }).then((waku) => waku.start().then(() => waku))
    ]);

    await waku1.libp2p.peerStore.save(waku2.libp2p.peerId, {
      multiaddrs: waku2.libp2p.getMultiaddrs()
    });
    await waku1.dial(waku2.libp2p.peerId);
    await waitForRemotePeer(waku1);

    const [waku1PeerInfo, waku2PeerInfo] = await Promise.all([
      waku2.libp2p.peerStore.get(waku1.libp2p.peerId),
      waku1.libp2p.peerStore.get(waku2.libp2p.peerId)
    ]);

    expect(bytesToUtf8(waku1PeerInfo.metadata.get("AgentVersion")!)).to.eq(
      waku1UserAgent
    );
    expect(bytesToUtf8(waku2PeerInfo.metadata.get("AgentVersion")!)).to.eq(
      DefaultUserAgent
    );
  });
});
