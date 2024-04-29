import {
  createDecoder,
  createEncoder,
  DecodedMessage,
  Decoder
} from "@waku/core";
import {
  LightNode,
  Protocols,
  ShardInfo,
  ShardingParams,
  type SingleShardInfo
} from "@waku/interfaces";
import { createLightNode, waitForRemotePeer } from "@waku/sdk";
import { Logger, singleShardInfoToPubsubTopic } from "@waku/utils";
import { expect } from "chai";
import { Context } from "mocha";

import { delay, NOISE_KEY_1, runNodes, ServiceNode } from "../../src";

export const log = new Logger("test:store");

export const TestClusterId = 3;
export const TestShardInfo: ShardInfo = {
  clusterId: TestClusterId,
  shards: [1, 2]
};

export const TestShardInfo1: SingleShardInfo = { clusterId: 3, shard: 1 };
export const TestPubsubTopic1 = singleShardInfoToPubsubTopic(TestShardInfo1);

export const TestShardInfo2: SingleShardInfo = { clusterId: 3, shard: 2 };
export const TestPubsubTopic2 = singleShardInfoToPubsubTopic(TestShardInfo2);

export const TestContentTopic1 = "/test/1/waku-store/utf8";
export const TestEncoder = createEncoder({
  contentTopic: TestContentTopic1,
  pubsubTopicShardInfo: TestShardInfo1
});
export const TestDecoder = createDecoder(TestContentTopic1, TestPubsubTopic1);

export const TestContentTopic2 = "/test/3/waku-store/utf8";
export const TestDecoder2 = createDecoder(TestContentTopic2, TestPubsubTopic2);

export const totalMsgs = 20;
export const messageText = "Store Push works!";

export async function sendMessages(
  instance: ServiceNode,
  numMessages: number,
  contentTopic: string,
  pubsubTopic: string
): Promise<void> {
  for (let i = 0; i < numMessages; i++) {
    expect(
      await instance.sendMessage(
        ServiceNode.toMessageRpcQuery({
          payload: new Uint8Array([i]),
          contentTopic: contentTopic
        }),
        pubsubTopic
      )
    ).to.eq(true);
    await delay(1); // to ensure each timestamp is unique.
  }
}

export async function sendMessagesAutosharding(
  instance: ServiceNode,
  numMessages: number,
  contentTopic: string
): Promise<void> {
  for (let i = 0; i < numMessages; i++) {
    expect(
      await instance.sendMessageAutosharding(
        ServiceNode.toMessageRpcQuery({
          payload: new Uint8Array([i]),
          contentTopic: contentTopic
        })
      )
    ).to.eq(true);
    await delay(1); // to ensure each timestamp is unique.
  }
}

export async function processQueriedMessages(
  instance: LightNode,
  decoders: Array<Decoder>,
  expectedTopic?: string
): Promise<DecodedMessage[]> {
  const localMessages: DecodedMessage[] = [];
  for await (const query of instance.store.queryGenerator(decoders)) {
    for await (const msg of query) {
      if (msg) {
        expect(msg.pubsubTopic).to.eq(expectedTopic);
        localMessages.push(msg as DecodedMessage);
      }
    }
  }
  return localMessages;
}

export async function startAndConnectLightNode(
  instance: ServiceNode,
  shardInfo: ShardingParams
): Promise<LightNode> {
  const waku = await createLightNode({
    staticNoiseKey: NOISE_KEY_1,
    libp2p: { addresses: { listen: ["/ip4/0.0.0.0/tcp/0/ws"] } },
    shardInfo: shardInfo
  });
  await waku.start();
  await waku.dial(await instance.getMultiaddrWithId());
  await waitForRemotePeer(waku, [Protocols.Store]);

  const wakuConnections = waku.libp2p.getConnections();
  const nwakuPeers = await instance.peers();

  if (wakuConnections.length < 1 || nwakuPeers.length < 1) {
    throw new Error(
      `Expected at least 1 peer in each node. Got waku connections: ${wakuConnections.length} and nwaku: ${nwakuPeers.length}`
    );
  }

  log.info("Waku node created");
  return waku;
}

export function chunkAndReverseArray(
  arr: number[],
  chunkSize: number
): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(...arr.slice(i, i + chunkSize).reverse());
  }
  return result.reverse();
}

export const adjustDate = (baseDate: Date, adjustMs: number): Date => {
  const adjusted = new Date(baseDate);
  adjusted.setTime(adjusted.getTime() + adjustMs);
  return adjusted;
};

export const runStoreNodes = (
  context: Context,
  shardInfo: ShardingParams
): Promise<[ServiceNode, LightNode]> =>
  runNodes({
    context,
    shardInfo,
    createNode: createLightNode,
    protocols: [Protocols.Store]
  });
