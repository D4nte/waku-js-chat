import { createEncoder } from "@waku/core";
import { IRateLimitProof, LightNode, ProtocolError } from "@waku/interfaces";
import { utf8ToBytes } from "@waku/sdk";
import { expect } from "chai";

import {
  afterEachCustom,
  beforeEachCustom,
  generateRandomUint8Array,
  ServiceNode,
  tearDownNodes,
  TEST_STRING
} from "../../../src/index.js";
import {
  messagePayload,
  messageText,
  runNodes,
  TestContentTopic,
  TestEncoder,
  TestPubsubTopic,
  TestShardInfo
} from "../utils.js";

// These tests are expected to fail as service nodes now require at least one more connected node: https://github.com/waku-org/nwaku/pull/2951/files

describe("Waku Light Push: Single Node: Fails as expected", function () {
  // Set the timeout for all tests in this suite. Can be overwritten at test level
  this.timeout(15000);
  let waku: LightNode;
  let nwaku: ServiceNode;

  beforeEachCustom(this, async () => {
    [nwaku, waku] = await runNodes(this.ctx, TestShardInfo);

    await nwaku.ensureSubscriptions([TestPubsubTopic]);
  });

  afterEachCustom(this, async () => {
    await tearDownNodes(nwaku, waku);
  });

  TEST_STRING.forEach((testItem) => {
    it(`Push message with ${testItem.description} payload`, async function () {
      const pushResponse = await waku.lightPush.send(TestEncoder, {
        payload: utf8ToBytes(testItem.value)
      });
      // Expect failure since node requires another connected node
      expect(pushResponse.successes.length).to.eq(0);
      expect(pushResponse.failures?.length).to.be.greaterThan(0);
    });
  });

  it("Push 30 different messages", async function () {
    const generateMessageText = (index: number): string => `M${index}`;

    for (let i = 0; i < 30; i++) {
      const pushResponse = await waku.lightPush.send(TestEncoder, {
        payload: utf8ToBytes(generateMessageText(i))
      });
      // Expect failure since node requires another connected node
      expect(pushResponse.successes.length).to.eq(0);
      expect(pushResponse.failures?.length).to.be.greaterThan(0);
    }
  });

  it("Push message with meta", async function () {
    const customTestEncoder = createEncoder({
      contentTopic: TestContentTopic,
      metaSetter: () => new Uint8Array(10),
      pubsubTopic: TestPubsubTopic
    });

    const pushResponse = await waku.lightPush.send(
      customTestEncoder,
      messagePayload
    );
    expect(pushResponse.successes.length).to.eq(0);
    expect(pushResponse.failures?.length).to.be.greaterThan(0);
  });

  it("Fails to push message with empty payload", async function () {
    const pushResponse = await waku.lightPush.send(TestEncoder, {
      payload: new Uint8Array()
    });

    expect(pushResponse.successes.length).to.eq(0);
    expect(pushResponse.failures?.map((failure) => failure.error)).to.include(
      ProtocolError.EMPTY_PAYLOAD
    );
  });

  it("Push message with rate limit", async function () {
    const rateLimitProof: IRateLimitProof = {
      proof: utf8ToBytes("proofData"),
      merkleRoot: utf8ToBytes("merkleRootData"),
      epoch: utf8ToBytes("epochData"),
      shareX: utf8ToBytes("shareXData"),
      shareY: utf8ToBytes("shareYData"),
      nullifier: utf8ToBytes("nullifierData"),
      rlnIdentifier: utf8ToBytes("rlnIdentifierData")
    };

    const pushResponse = await waku.lightPush.send(TestEncoder, {
      payload: utf8ToBytes(messageText),
      rateLimitProof: rateLimitProof
    });
    expect(pushResponse.successes.length).to.eq(0);
    expect(pushResponse.failures?.length).to.be.greaterThan(0);
  });

  [
    Date.now() - 3600000 * 24 * 356,
    Date.now() - 3600000,
    Date.now() + 3600000
  ].forEach((testItem) => {
    it(`Push message with custom timestamp: ${testItem}`, async function () {
      const pushResponse = await waku.lightPush.send(TestEncoder, {
        payload: utf8ToBytes(messageText),
        timestamp: new Date(testItem)
      });
      expect(pushResponse.successes.length).to.eq(0);
      expect(pushResponse.failures?.length).to.be.greaterThan(0);
    });
  });

  it("Push message equal or less that 1MB", async function () {
    const bigPayload = generateRandomUint8Array(65536);
    const pushResponse = await waku.lightPush.send(TestEncoder, {
      payload: bigPayload
    });
    expect(pushResponse.successes.length).to.eq(0);
    expect(pushResponse.failures?.length).to.be.greaterThan(0);
  });

  it("Fails to push message bigger that 1MB", async function () {
    const MB = 1024 ** 2;

    const pushResponse = await waku.lightPush.send(TestEncoder, {
      payload: generateRandomUint8Array(MB + 65536)
    });
    expect(pushResponse.successes.length).to.eq(0);
    expect(pushResponse.failures?.map((failure) => failure.error)).to.include(
      ProtocolError.SIZE_TOO_BIG
    );
  });
});
