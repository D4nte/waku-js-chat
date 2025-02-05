import {
  LightNode,
  ProtocolError,
  ShardInfo,
  SingleShardInfo
} from "@waku/interfaces";
import { createEncoder, createLightNode, utf8ToBytes } from "@waku/sdk";
import {
  shardInfoToPubsubTopics,
  singleShardInfosToShardInfo,
  singleShardInfoToPubsubTopic
} from "@waku/utils";
import { expect } from "chai";

import {
  afterEachCustom,
  runMultipleNodes,
  ServiceNodesFleet,
  tearDownNodes
} from "../../src/index.js";

const ContentTopic = "/waku/2/content/test.js";

describe("Static Sharding: Running Nodes", function () {
  this.timeout(15_000);
  let waku: LightNode;
  let serviceNodes: ServiceNodesFleet;

  afterEachCustom(this, async () => {
    await tearDownNodes(serviceNodes.nodes, waku);
  });

  describe("Different clusters and shards", function () {
    it("shard 0", async function () {
      const singleShardInfo = { clusterId: 0, shard: 0 };
      const shardInfo = singleShardInfosToShardInfo([singleShardInfo]);

      [serviceNodes, waku] = await runMultipleNodes(
        this.ctx,
        shardInfo,
        {
          store: true,
          lightpush: true,
          relay: true,
          pubsubTopic: shardInfoToPubsubTopics(shardInfo)
        },
        false,
        2,
        true
      );

      const encoder = createEncoder({
        contentTopic: ContentTopic,
        pubsubTopicShardInfo: singleShardInfo
      });
      expect(encoder.pubsubTopic).to.eq(
        singleShardInfoToPubsubTopic(singleShardInfo)
      );

      const request = await waku.lightPush.send(encoder, {
        payload: utf8ToBytes("Hello World")
      });

      expect(request.successes.length).to.eq(2);
      expect(
        await serviceNodes.messageCollector.waitForMessages(1, {
          pubsubTopic: shardInfoToPubsubTopics(shardInfo)[0]
        })
      ).to.eq(true);
    });

    it("Cluster ID 0 - Default/Global Cluster", async function () {
      const singleShardInfo = { clusterId: 0, shard: 1 };
      const shardInfo = singleShardInfosToShardInfo([singleShardInfo]);

      [serviceNodes, waku] = await runMultipleNodes(
        this.ctx,
        shardInfo,
        {
          store: true,
          lightpush: true,
          relay: true,
          pubsubTopic: shardInfoToPubsubTopics(shardInfo)
        },
        false,
        2,
        true
      );

      const encoder = createEncoder({
        contentTopic: ContentTopic,
        pubsubTopicShardInfo: singleShardInfo
      });

      const request = await waku.lightPush.send(encoder, {
        payload: utf8ToBytes("Hello World")
      });

      expect(request.successes.length).to.eq(2);
      expect(
        await serviceNodes.messageCollector.waitForMessages(1, {
          pubsubTopic: shardInfoToPubsubTopics(shardInfo)[0]
        })
      ).to.eq(true);
    });

    const numTest = 10;
    for (let i = 0; i < numTest; i++) {
      // Random clusterId between 2 and 1000
      const clusterId = Math.floor(Math.random() * 999) + 2;
      // Random shardId between 1 and 1000
      const shardId = Math.floor(Math.random() * 1000) + 1;

      it(`random static sharding ${
        i + 1
      } - Cluster ID: ${clusterId}, Shard ID: ${shardId}`, async function () {
        const singleShardInfo = { clusterId: clusterId, shard: shardId };
        const shardInfo = singleShardInfosToShardInfo([singleShardInfo]);

        [serviceNodes, waku] = await runMultipleNodes(
          this.ctx,
          shardInfo,
          {
            store: true,
            lightpush: true,
            relay: true,
            clusterId: clusterId,
            pubsubTopic: shardInfoToPubsubTopics(shardInfo)
          },
          false,
          2,
          true
        );

        const encoder = createEncoder({
          contentTopic: ContentTopic,
          pubsubTopicShardInfo: singleShardInfo
        });

        const request = await waku.lightPush.send(encoder, {
          payload: utf8ToBytes("Hello World")
        });

        expect(request.successes.length).to.eq(2);
        expect(
          await serviceNodes.messageCollector.waitForMessages(1, {
            pubsubTopic: shardInfoToPubsubTopics(shardInfo)[0]
          })
        ).to.eq(true);
      });
    }
  });

  describe("Others", function () {
    const clusterId = 2;
    const shardInfoFirstShard: ShardInfo = {
      clusterId: clusterId,
      shards: [2]
    };
    const shardInfoSecondShard: ShardInfo = {
      clusterId: clusterId,
      shards: [3]
    };
    const shardInfoBothShards: ShardInfo = {
      clusterId: clusterId,
      shards: [2, 3]
    };
    const singleShardInfo1: SingleShardInfo = {
      clusterId: clusterId,
      shard: 2
    };
    const singleShardInfo2: SingleShardInfo = {
      clusterId: clusterId,
      shard: 3
    };

    it("configure the node with multiple pubsub topics", async function () {
      [serviceNodes, waku] = await runMultipleNodes(
        this.ctx,
        shardInfoBothShards,
        {
          store: true,
          lightpush: true,
          relay: true,
          clusterId: clusterId,
          pubsubTopic: shardInfoToPubsubTopics(shardInfoBothShards)
        },
        false,
        2,
        true
      );

      const encoder1 = createEncoder({
        contentTopic: ContentTopic,
        pubsubTopicShardInfo: singleShardInfo1
      });

      const encoder2 = createEncoder({
        contentTopic: ContentTopic,
        pubsubTopicShardInfo: singleShardInfo2
      });

      const request1 = await waku.lightPush.send(encoder1, {
        payload: utf8ToBytes("Hello World2")
      });
      expect(request1.successes.length).to.eq(2);
      expect(
        await serviceNodes.messageCollector.waitForMessages(1, {
          pubsubTopic: shardInfoToPubsubTopics(shardInfoFirstShard)[0]
        })
      ).to.eq(true);

      const request2 = await waku.lightPush.send(encoder2, {
        payload: utf8ToBytes("Hello World3")
      });
      expect(request2.successes.length).to.eq(2);
      expect(
        await serviceNodes.messageCollector.waitForMessages(1, {
          pubsubTopic: shardInfoToPubsubTopics(shardInfoSecondShard)[0]
        })
      ).to.eq(true);
    });

    it("using a protocol with unconfigured pubsub topic should fail", async function () {
      this.timeout(15_000);
      [serviceNodes, waku] = await runMultipleNodes(
        this.ctx,
        shardInfoFirstShard,
        {
          store: true,
          lightpush: true,
          relay: true,
          clusterId: clusterId,
          pubsubTopic: shardInfoToPubsubTopics(shardInfoFirstShard)
        },
        false,
        2,
        true
      );

      // use a pubsub topic that is not configured
      const encoder = createEncoder({
        contentTopic: ContentTopic,
        pubsubTopicShardInfo: singleShardInfo2
      });

      const { successes, failures } = await waku.lightPush.send(encoder, {
        payload: utf8ToBytes("Hello World")
      });

      if (successes.length > 0 || !failures?.length) {
        throw new Error("The request should've thrown an error");
      }

      const errors = failures.map((failure) => failure.error);
      expect(errors).to.include(ProtocolError.TOPIC_NOT_CONFIGURED);
    });

    it("start node with empty shard should fail", async function () {
      try {
        await createLightNode({
          networkConfig: { clusterId: clusterId, shards: [] }
        });
        throw new Error(
          "Starting the node with no shard should've thrown an error"
        );
      } catch (err) {
        if (
          !(err instanceof Error) ||
          !err.message.includes(
            "Invalid shards configuration: please provide at least one shard"
          )
        ) {
          throw err;
        }
      }
    });
  });
});
