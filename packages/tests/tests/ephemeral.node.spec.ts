import { createDecoder, createEncoder, DecodedMessage } from "@waku/core";
import { Protocols } from "@waku/interfaces";
import type { LightNode } from "@waku/interfaces";
import {
  generatePrivateKey,
  generateSymmetricKey,
  getPublicKey
} from "@waku/message-encryption";
import {
  createDecoder as createEciesDecoder,
  createEncoder as createEciesEncoder
} from "@waku/message-encryption/ecies";
import {
  createDecoder as createSymDecoder,
  createEncoder as createSymEncoder
} from "@waku/message-encryption/symmetric";
import { createLightNode } from "@waku/sdk";
import { contentTopicToPubsubTopic, Logger } from "@waku/utils";
import { bytesToUtf8, utf8ToBytes } from "@waku/utils/bytes";
import { expect } from "chai";

import {
  afterEachCustom,
  beforeEachCustom,
  delay,
  NOISE_KEY_1,
  NOISE_KEY_2,
  runMultipleNodes,
  ServiceNodesFleet,
  teardownNodesWithRedundancy
} from "../src/index.js";

const log = new Logger("test:ephemeral");

const ClusterId = 2;
const TestContentTopic = "/test/1/ephemeral/utf8";
const PubsubTopic = contentTopicToPubsubTopic(TestContentTopic, ClusterId);

const TestEncoder = createEncoder({
  contentTopic: TestContentTopic,
  pubsubTopic: PubsubTopic
});
const TestDecoder = createDecoder(TestContentTopic, PubsubTopic);

const privateKey = generatePrivateKey();
const symKey = generateSymmetricKey();
const publicKey = getPublicKey(privateKey);

const AsymContentTopic = "/test/1/ephemeral-asym/utf8";
const SymContentTopic = "/test/1/ephemeral-sym/utf8";

const AsymEncoder = createEciesEncoder({
  contentTopic: AsymContentTopic,
  publicKey,
  ephemeral: true,
  pubsubTopic: PubsubTopic
});
const SymEncoder = createSymEncoder({
  contentTopic: SymContentTopic,
  symKey,
  ephemeral: true,
  pubsubTopic: PubsubTopic
});
const ClearEncoder = createEncoder({
  contentTopic: TestContentTopic,
  ephemeral: true,
  pubsubTopic: PubsubTopic
});

const AsymDecoder = createEciesDecoder(
  AsymContentTopic,
  privateKey,
  PubsubTopic
);
const SymDecoder = createSymDecoder(SymContentTopic, symKey, PubsubTopic);

describe("Waku Message Ephemeral field", function () {
  let waku: LightNode;
  let serviceNodes: ServiceNodesFleet;

  afterEachCustom(this, async () => {
    await teardownNodesWithRedundancy(serviceNodes, waku);
  });

  beforeEachCustom(this, async () => {
    [serviceNodes, waku] = await runMultipleNodes(
      this.ctx,
      {
        clusterId: ClusterId,
        contentTopics: [TestContentTopic, AsymContentTopic, SymContentTopic]
      },
      {
        filter: true,
        lightpush: true,
        store: true,
        relay: true,
        pubsubTopic: [PubsubTopic]
      },
      true,
      2
    );

    await Promise.all(
      serviceNodes.nodes.map(async (node) => {
        await node.ensureSubscriptionsAutosharding([
          TestContentTopic,
          AsymContentTopic,
          SymContentTopic
        ]);
      })
    );
  });

  it("Ephemeral messages are not stored", async function () {
    this.timeout(50_000);

    const asymText =
      "This message is encrypted for me using asymmetric encryption";
    const symText =
      "This message is encrypted for me using symmetric encryption";
    const clearText = "This is a clear text message";

    const asymMsg = { payload: utf8ToBytes(asymText) };
    const symMsg = {
      payload: utf8ToBytes(symText)
    };
    const clearMsg = {
      payload: utf8ToBytes(clearText)
    };

    const [waku1, waku2] = await Promise.all([
      createLightNode({
        staticNoiseKey: NOISE_KEY_1,
        networkConfig: {
          contentTopics: [TestContentTopic, AsymContentTopic, SymContentTopic],
          clusterId: ClusterId
        }
      }).then((waku) => waku.start().then(() => waku)),
      createLightNode({
        staticNoiseKey: NOISE_KEY_2,
        networkConfig: {
          contentTopics: [TestContentTopic, AsymContentTopic, SymContentTopic],
          clusterId: ClusterId
        }
      }).then((waku) => waku.start().then(() => waku))
    ]);

    log.info("Waku nodes created");

    await Promise.all(
      serviceNodes.nodes.map(async (node) => {
        const multiaddr = await node.getMultiaddrWithId();
        await waku1.dial(multiaddr);
        await waku2.dial(multiaddr);
      })
    );

    log.info("Waku nodes connected to nwaku");

    await waku.waitForPeers([Protocols.LightPush]);

    log.info("Sending messages using light push");
    await Promise.all([
      waku1.lightPush.send(AsymEncoder, asymMsg),
      waku1.lightPush.send(SymEncoder, symMsg),
      waku1.lightPush.send(ClearEncoder, clearMsg)
    ]);

    await waku2.waitForPeers([Protocols.Store]);

    const messages: DecodedMessage[] = [];

    log.info("Retrieving messages from store");
    for await (const msgPromises of waku2.store.queryGenerator([
      AsymDecoder,
      SymDecoder,
      TestDecoder
    ])) {
      for (const promise of msgPromises) {
        const msg = await promise;
        if (msg) {
          messages.push(msg);
        }
      }
    }

    expect(messages?.length).eq(0);

    await teardownNodesWithRedundancy(serviceNodes, [waku1, waku2]);
  });

  it("Ephemeral field is preserved - encoder v0", async function () {
    this.timeout(10000);

    const ephemeralEncoder = createEncoder({
      contentTopic: TestContentTopic,
      ephemeral: true,
      pubsubTopic: PubsubTopic
    });

    const messages: DecodedMessage[] = [];
    const callback = (msg: DecodedMessage): void => {
      messages.push(msg);
    };
    await waku.filter.subscribe([TestDecoder], callback);

    await delay(200);
    const normalTxt = "Normal message";
    const ephemeralTxt = "Ephemeral Message";

    await Promise.all([
      waku.lightPush.send(TestEncoder, {
        payload: utf8ToBytes(normalTxt)
      }),
      waku.lightPush.send(ephemeralEncoder, {
        payload: utf8ToBytes(ephemeralTxt)
      })
    ]);

    while (messages.length < 2) {
      await delay(250);
    }

    const normalMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === normalTxt
    );
    const ephemeralMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === ephemeralTxt
    );

    expect(normalMsg).to.not.be.undefined;
    expect(ephemeralMsg).to.not.be.undefined;

    expect(normalMsg!.ephemeral).to.be.false;
    expect(ephemeralMsg!.ephemeral).to.be.true;
  });

  it("Ephemeral field is preserved - symmetric encryption", async function () {
    this.timeout(10000);

    const encoder = createSymEncoder({
      contentTopic: SymContentTopic,
      symKey,
      pubsubTopic: PubsubTopic
    });
    const decoder = createSymDecoder(SymContentTopic, symKey, PubsubTopic);

    const messages: DecodedMessage[] = [];
    const callback = (msg: DecodedMessage): void => {
      messages.push(msg);
    };
    await waku.filter.subscribe([decoder], callback);

    await delay(200);
    const normalTxt = "Normal message";
    const ephemeralTxt = "Ephemeral Message";

    await Promise.all([
      waku.lightPush.send(encoder, {
        payload: utf8ToBytes(normalTxt)
      }),
      waku.lightPush.send(SymEncoder, {
        payload: utf8ToBytes(ephemeralTxt)
      })
    ]);

    while (messages.length < 2) {
      await delay(250);
    }

    const normalMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === normalTxt
    );
    const ephemeralMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === ephemeralTxt
    );

    expect(normalMsg).to.not.be.undefined;
    expect(ephemeralMsg).to.not.be.undefined;

    expect(normalMsg!.ephemeral).to.be.false;
    expect(ephemeralMsg!.ephemeral).to.be.true;
  });

  it("Ephemeral field is preserved - asymmetric encryption", async function () {
    this.timeout(10000);

    const encoder = createEciesEncoder({
      contentTopic: AsymContentTopic,
      publicKey: publicKey,
      pubsubTopic: PubsubTopic
    });
    const decoder = createEciesDecoder(
      AsymContentTopic,
      privateKey,
      PubsubTopic
    );

    const messages: DecodedMessage[] = [];
    const callback = (msg: DecodedMessage): void => {
      messages.push(msg);
    };
    await waku.filter.subscribe([decoder], callback);

    await delay(200);
    const normalTxt = "Normal message";
    const ephemeralTxt = "Ephemeral Message";

    await Promise.all([
      waku.lightPush.send(encoder, {
        payload: utf8ToBytes(normalTxt)
      }),
      waku.lightPush.send(AsymEncoder, {
        payload: utf8ToBytes(ephemeralTxt)
      })
    ]);

    while (messages.length < 2) {
      await delay(250);
    }

    const normalMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === normalTxt
    );
    const ephemeralMsg = messages.find(
      (msg) => bytesToUtf8(msg.payload) === ephemeralTxt
    );

    expect(normalMsg).to.not.be.undefined;
    expect(ephemeralMsg).to.not.be.undefined;

    expect(normalMsg!.ephemeral).to.be.false;
    expect(ephemeralMsg!.ephemeral).to.be.true;
  });
});
