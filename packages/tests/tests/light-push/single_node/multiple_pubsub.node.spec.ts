import type { PeerId } from "@libp2p/interface";
import { createEncoder } from "@waku/core";
import {
  ContentTopicInfo,
  LightNode,
  NetworkConfig,
  Protocols,
  ShardInfo,
  SingleShardInfo
} from "@waku/interfaces";
import {
  contentTopicToPubsubTopic,
  contentTopicToShardIndex,
  pubsubTopicToSingleShardInfo,
  singleShardInfoToPubsubTopic
} from "@waku/utils";
import { utf8ToBytes } from "@waku/utils/bytes";
import { expect } from "chai";

import {
  afterEachCustom,
  beforeEachCustom,
  runMultipleNodes,
  ServiceNodesFleet,
  tearDownNodes
} from "../../../src/index.js";
import { messageText } from "../utils.js";

describe("Waku Light Push : Multiple PubsubTopics", function () {
  this.timeout(30000);
  let waku: LightNode;
  let serviceNodes: ServiceNodesFleet;

  const shardInfo: ShardInfo = { clusterId: 3, shards: [1, 2] };
  const singleShardInfo1: SingleShardInfo = { clusterId: 3, shard: 1 };
  const singleShardInfo2: SingleShardInfo = { clusterId: 3, shard: 2 };

  const customPubsubTopic1 = singleShardInfoToPubsubTopic(singleShardInfo1);
  const customPubsubTopic2 = singleShardInfoToPubsubTopic(singleShardInfo2);
  const customContentTopic1 = "/test/2/waku-light-push/utf8";
  const customContentTopic2 = "/test/3/waku-light-push/utf8";
  const customEncoder1 = createEncoder({
    pubsubTopicShardInfo: singleShardInfo1,
    contentTopic: customContentTopic1
  });
  const customEncoder2 = createEncoder({
    pubsubTopicShardInfo: singleShardInfo2,
    contentTopic: customContentTopic2
  });

  let node1PeerId: PeerId;

  beforeEachCustom(this, async () => {
    [serviceNodes, waku] = await runMultipleNodes(
      this.ctx,
      shardInfo,
      undefined,
      true,
      2,
      true
    );
    node1PeerId = await serviceNodes.nodes[0].getPeerId();
  });

  afterEachCustom(this, async () => {
    await tearDownNodes(serviceNodes.nodes, waku);
  });

  it("Push message on custom pubsubTopic", async function () {
    const pushResponse = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes(messageText)
    });

    expect(pushResponse.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: customPubsubTopic1
      })
    ).to.eq(true);
    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: messageText,
      expectedContentTopic: customContentTopic1
    });
  });

  it("Subscribe and receive messages on 2 different pubsubtopics", async function () {
    const pushResponse1 = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    const pushResponse2 = await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });
    expect(pushResponse1.successes[0].toString()).to.eq(node1PeerId.toString());
    expect(pushResponse2.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: customPubsubTopic1
      })
    ).to.eq(true);

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: customPubsubTopic2
      })
    ).to.eq(true);

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: customPubsubTopic1
    });
    serviceNodes.messageCollector.verifyReceivedMessage(1, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: customPubsubTopic2
    });
  });

  it("Light push messages to 2 service nodes each with different pubsubtopics", async function () {
    const [serviceNodes2, waku2] = await runMultipleNodes(
      this.ctx,
      {
        clusterId: singleShardInfo2.clusterId,
        shards: [singleShardInfo2.shard!]
      },
      undefined,
      true,
      1
    );

    await serviceNodes2.nodes[0].ensureSubscriptions([
      singleShardInfoToPubsubTopic(singleShardInfo2)
    ]);
    await waku.dial(await serviceNodes2.nodes[0].getMultiaddrWithId());
    await waku.waitForPeers([Protocols.LightPush]);

    await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });

    await serviceNodes.messageCollector.waitForMessages(1, {
      pubsubTopic: customPubsubTopic1
    });
    await serviceNodes2.messageCollector.waitForMessages(1, {
      pubsubTopic: singleShardInfoToPubsubTopic(singleShardInfo2)
    });

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: customPubsubTopic1
    });
    serviceNodes2.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: singleShardInfoToPubsubTopic(singleShardInfo2)
    });

    // Clean up second fleet
    await tearDownNodes(serviceNodes2.nodes, waku2);
  });
});

describe("Waku Light Push (Autosharding): Multiple PubsubTopics", function () {
  this.timeout(30000);
  let waku: LightNode;
  let serviceNodes: ServiceNodesFleet;

  const clusterId = 4;
  const customContentTopic1 = "/waku/2/content/test.js";
  const customContentTopic2 = "/myapp/1/latest/proto";
  const autoshardingPubsubTopic1 = contentTopicToPubsubTopic(
    customContentTopic1,
    clusterId
  );
  const autoshardingPubsubTopic2 = contentTopicToPubsubTopic(
    customContentTopic2,
    clusterId
  );
  const shardInfo: ContentTopicInfo = {
    clusterId,
    contentTopics: [customContentTopic1, customContentTopic2]
  };
  const customEncoder1 = createEncoder({
    contentTopic: customContentTopic1,
    pubsubTopicShardInfo: pubsubTopicToSingleShardInfo(autoshardingPubsubTopic1)
  });
  const customEncoder2 = createEncoder({
    contentTopic: customContentTopic2,
    pubsubTopicShardInfo: pubsubTopicToSingleShardInfo(autoshardingPubsubTopic2)
  });

  let node1PeerId: PeerId;

  beforeEachCustom(this, async () => {
    [serviceNodes, waku] = await runMultipleNodes(
      this.ctx,
      shardInfo,
      undefined,
      true,
      2,
      true
    );
    node1PeerId = await serviceNodes.nodes[0].getPeerId();
  });

  afterEachCustom(this, async () => {
    await tearDownNodes(serviceNodes.nodes, waku);
  });

  it("Push message on custom pubsubTopic", async function () {
    const pushResponse = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes(messageText)
    });

    expect(pushResponse.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic1
      })
    ).to.eq(true);
    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: messageText,
      expectedContentTopic: customContentTopic1
    });
  });

  it("Subscribe and receive messages on 2 different pubsubtopics", async function () {
    const pushResponse1 = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    const pushResponse2 = await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });
    expect(pushResponse1.successes[0].toString()).to.eq(node1PeerId.toString());
    expect(pushResponse2.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic1
      })
    ).to.eq(true);

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic2
      })
    ).to.eq(true);

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: autoshardingPubsubTopic1
    });
    serviceNodes.messageCollector.verifyReceivedMessage(1, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: autoshardingPubsubTopic2
    });
  });

  it("Light push messages to 2 service nodes each with different pubsubtopics", async function () {
    // Create a second fleet for the second pubsub topic
    const [serviceNodes2, waku2] = await runMultipleNodes(
      this.ctx,
      { clusterId, contentTopics: [customContentTopic2] },
      undefined,
      true,
      1 // Only need one node for second fleet
    );

    await serviceNodes2.nodes[0].ensureSubscriptionsAutosharding([
      customContentTopic2
    ]);
    await waku.dial(await serviceNodes2.nodes[0].getMultiaddrWithId());
    await waku.waitForPeers([Protocols.LightPush]);

    await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });

    await serviceNodes.messageCollector.waitForMessagesAutosharding(1, {
      contentTopic: customContentTopic1
    });
    await serviceNodes2.messageCollector.waitForMessagesAutosharding(1, {
      contentTopic: customContentTopic2
    });

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: autoshardingPubsubTopic1
    });
    serviceNodes2.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: autoshardingPubsubTopic2
    });

    // Clean up second fleet
    await tearDownNodes(serviceNodes2.nodes, waku2);
  });
});

describe("Waku Light Push (named sharding): Multiple PubsubTopics", function () {
  this.timeout(30000);
  let waku: LightNode;
  let serviceNodes: ServiceNodesFleet;

  const clusterId = 3;
  const customContentTopic1 = "/waku/2/content/utf8";
  const customContentTopic2 = "/myapp/1/latest/proto";
  const autoshardingPubsubTopic1 = contentTopicToPubsubTopic(
    customContentTopic1,
    clusterId
  );
  const autoshardingPubsubTopic2 = contentTopicToPubsubTopic(
    customContentTopic2,
    clusterId
  );

  const shardInfo1 = {
    clusterId,
    shards: [contentTopicToShardIndex(customContentTopic1)]
  };
  const customEncoder1 = createEncoder({
    contentTopic: customContentTopic1,
    pubsubTopicShardInfo: shardInfo1
  });

  const shardInfo2 = {
    clusterId,
    shards: [contentTopicToShardIndex(customContentTopic2)]
  };
  const customEncoder2 = createEncoder({
    contentTopic: customContentTopic2,
    pubsubTopicShardInfo: shardInfo2
  });

  const testShardInfo: NetworkConfig = {
    clusterId,
    shards: [
      contentTopicToShardIndex(customContentTopic1),
      contentTopicToShardIndex(customContentTopic2)
    ]
  };

  let node1PeerId: PeerId;

  beforeEachCustom(this, async () => {
    [serviceNodes, waku] = await runMultipleNodes(
      this.ctx,
      testShardInfo,
      undefined,
      true,
      2,
      true
    );
    node1PeerId = await serviceNodes.nodes[0].getPeerId();
  });

  afterEachCustom(this, async () => {
    await tearDownNodes(serviceNodes.nodes, waku);
  });

  it("Push message on custom pubsubTopic", async function () {
    const pushResponse = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes(messageText)
    });

    expect(pushResponse.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic1
      })
    ).to.eq(true);
    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: messageText,
      expectedContentTopic: customContentTopic1
    });
  });

  it("Subscribe and receive messages on 2 different pubsubtopics", async function () {
    const pushResponse1 = await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    const pushResponse2 = await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });
    expect(pushResponse1.successes[0].toString()).to.eq(node1PeerId.toString());
    expect(pushResponse2.successes[0].toString()).to.eq(node1PeerId.toString());

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic1
      })
    ).to.eq(true);

    expect(
      await serviceNodes.messageCollector.waitForMessages(1, {
        pubsubTopic: autoshardingPubsubTopic2
      })
    ).to.eq(true);

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: autoshardingPubsubTopic1
    });
    serviceNodes.messageCollector.verifyReceivedMessage(1, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: autoshardingPubsubTopic2
    });
  });

  it("Light push messages to 2 service nodes each with different pubsubtopics", async function () {
    const [serviceNodes2, waku2] = await runMultipleNodes(
      this.ctx,
      shardInfo2,
      undefined,
      true,
      1
    );

    await serviceNodes2.nodes[0].ensureSubscriptions([
      autoshardingPubsubTopic2
    ]);
    await waku.dial(await serviceNodes2.nodes[0].getMultiaddrWithId());
    await waku.waitForPeers([Protocols.LightPush]);

    await waku.lightPush.send(customEncoder1, {
      payload: utf8ToBytes("M1")
    });
    await waku.lightPush.send(customEncoder2, {
      payload: utf8ToBytes("M2")
    });

    await serviceNodes.messageCollector.waitForMessages(1, {
      pubsubTopic: autoshardingPubsubTopic1
    });
    await serviceNodes2.messageCollector.waitForMessages(1, {
      pubsubTopic: autoshardingPubsubTopic2
    });

    serviceNodes.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M1",
      expectedContentTopic: customContentTopic1,
      expectedPubsubTopic: autoshardingPubsubTopic1
    });
    serviceNodes2.messageCollector.verifyReceivedMessage(0, {
      expectedMessageText: "M2",
      expectedContentTopic: customContentTopic2,
      expectedPubsubTopic: autoshardingPubsubTopic2
    });

    // Clean up second fleet
    await tearDownNodes(serviceNodes2.nodes, waku2);
  });
});
