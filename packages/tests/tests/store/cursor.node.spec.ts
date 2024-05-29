import { DecodedMessage } from "@waku/core";
import type { LightNode } from "@waku/interfaces";
import { bytesToUtf8 } from "@waku/utils/bytes";
import { expect } from "chai";

import {
  afterEachCustom,
  beforeEachCustom,
  ServiceNodesFleet,
  tearDownNodes
} from "../../src";

import {
  TestDecoder,
  TestDecoder2,
  TestShardInfo,
  totalMsgs
} from "./single_node/utils";
import {
  runMultipleNodes,
  sendMessagesToMultipleNodes,
  startAndConnectLightNodeWithMultipleServiceNodes
} from "./utils";

describe("Waku Store: Multiple Nodes: cursor", function () {
  this.timeout(15000);
  let waku: LightNode;
  let waku2: LightNode;
  let serviceNodesFleet: ServiceNodesFleet;

  beforeEachCustom(this, async () => {
    [serviceNodesFleet, waku] = await runMultipleNodes(this.ctx, TestShardInfo);
  });

  afterEachCustom(this, async () => {
    await tearDownNodes(serviceNodesFleet.nodes, [waku, waku2]);
  });

  [
    [2, 4],
    [0, 20],
    [10, 40],
    [19, 20],
    [19, 50],
    [110, 120]
  ].forEach(([cursorIndex, messageCount]) => {
    it(`Passing a valid cursor at ${cursorIndex} index when there are ${messageCount} messages`, async function () {
      await sendMessagesToMultipleNodes(
        serviceNodesFleet.nodes,
        messageCount,
        TestDecoder.contentTopic,
        TestDecoder.pubsubTopic
      );

      // messages in reversed order (first message at last index)
      const messages: DecodedMessage[] = [];
      for await (const page of waku.store.queryGenerator([TestDecoder])) {
        for await (const msg of page.reverse()) {
          messages.push(msg as DecodedMessage);
        }
      }

      // create cursor to extract messages after the cursorIndex
      const cursor = waku.store.createCursor(messages[cursorIndex]);

      const messagesAfterCursor: DecodedMessage[] = [];
      for await (const page of waku.store.queryGenerator([TestDecoder], {
        cursor
      })) {
        for await (const msg of page.reverse()) {
          if (msg) {
            messagesAfterCursor.push(msg as DecodedMessage);
          }
        }
      }

      expect(messages.length).be.eql(messageCount);
      expect(messagesAfterCursor.length).be.eql(messageCount - cursorIndex - 1);
      if (cursorIndex == messages.length - 1) {
        // in this case the cursor will return nothin because it points at the end of the list
        expect(messagesAfterCursor).be.eql([]);
      } else {
        expect(bytesToUtf8(messagesAfterCursor[0].payload)).to.be.eq(
          bytesToUtf8(messages[cursorIndex + 1].payload)
        );
        expect(
          bytesToUtf8(
            messagesAfterCursor[messagesAfterCursor.length - 1].payload
          )
        ).to.be.eq(bytesToUtf8(messages[messages.length - 1].payload));
      }
    });
  });

  it("Reusing cursor across nodes", async function () {
    await sendMessagesToMultipleNodes(
      serviceNodesFleet.nodes,
      totalMsgs,
      TestDecoder.contentTopic,
      TestDecoder.pubsubTopic
    );
    waku2 = await startAndConnectLightNodeWithMultipleServiceNodes(
      serviceNodesFleet.nodes,
      TestShardInfo
    );

    // messages in reversed order (first message at last index)
    const messages: DecodedMessage[] = [];
    for await (const page of waku.store.queryGenerator([TestDecoder])) {
      for await (const msg of page.reverse()) {
        messages.push(msg as DecodedMessage);
      }
    }

    // create cursor to extract messages after the cursorIndex
    const cursor = waku.store.createCursor(messages[5]);

    // query node2 with the cursor from node1
    const messagesAfterCursor: DecodedMessage[] = [];
    for await (const page of waku2.store.queryGenerator([TestDecoder], {
      cursor
    })) {
      for await (const msg of page.reverse()) {
        if (msg) {
          messagesAfterCursor.push(msg as DecodedMessage);
        }
      }
    }

    expect(messages.length).be.eql(totalMsgs);
    expect(messagesAfterCursor.length).be.eql(totalMsgs - 6);
    expect(bytesToUtf8(messagesAfterCursor[0].payload)).to.be.eq(
      bytesToUtf8(messages[6].payload)
    );
    expect(
      bytesToUtf8(messagesAfterCursor[messagesAfterCursor.length - 1].payload)
    ).to.be.eq(bytesToUtf8(messages[messages.length - 1].payload));
  });

  it("Passing cursor with wrong message digest", async function () {
    await sendMessagesToMultipleNodes(
      serviceNodesFleet.nodes,
      totalMsgs,
      TestDecoder.contentTopic,
      TestDecoder.pubsubTopic
    );

    const messages: DecodedMessage[] = [];
    for await (const page of waku.store.queryGenerator([TestDecoder])) {
      for await (const msg of page.reverse()) {
        messages.push(msg as DecodedMessage);
      }
    }
    const cursor = waku.store.createCursor(messages[5]);

    // setting a wrong digest
    cursor.digest = new Uint8Array([]);

    const messagesAfterCursor: DecodedMessage[] = [];
    try {
      for await (const page of waku.store.queryGenerator([TestDecoder], {
        cursor
      })) {
        for await (const msg of page.reverse()) {
          if (msg) {
            messagesAfterCursor.push(msg as DecodedMessage);
          }
        }
      }
      // Should return same as go-waku. Raised bug: https://github.com/waku-org/nwaku/issues/2117
      expect(messagesAfterCursor.length).to.eql(0);
    } catch (error) {
      for (const node of serviceNodesFleet.nodes) {
        if (
          node.type === "go-waku" &&
          typeof error === "string" &&
          error.includes("History response contains an Error: INVALID_CURSOR")
        ) {
          return;
        }
      }
      throw error instanceof Error
        ? new Error(`Unexpected error: ${error.message}`)
        : error;
    }
  });

  it("Passing cursor with wrong pubsubTopic", async function () {
    await sendMessagesToMultipleNodes(
      serviceNodesFleet.nodes,
      totalMsgs,
      TestDecoder.contentTopic,
      TestDecoder.pubsubTopic
    );

    const messages: DecodedMessage[] = [];
    for await (const page of waku.store.queryGenerator([TestDecoder])) {
      for await (const msg of page.reverse()) {
        messages.push(msg as DecodedMessage);
      }
    }
    messages[5].pubsubTopic = TestDecoder2.pubsubTopic;
    const cursor = waku.store.createCursor(messages[5]);

    try {
      for await (const page of waku.store.queryGenerator([TestDecoder], {
        cursor
      })) {
        void page;
      }
      throw new Error("Cursor with wrong pubsubtopic was accepted");
    } catch (err) {
      if (
        !(err instanceof Error) ||
        !err.message.includes(
          `Cursor pubsub topic (${TestDecoder2.pubsubTopic}) does not match decoder pubsub topic (${TestDecoder.pubsubTopic})`
        )
      ) {
        throw err;
      }
    }
  });
});
