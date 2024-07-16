import type { PeerId } from "@libp2p/interface";

import type { IDecodedMessage, IDecoder } from "./message.js";
import type { ContentTopic, PubsubTopic, ThisOrThat } from "./misc.js";
import type {
  Callback,
  IBaseProtocolCore,
  IBaseProtocolSDK,
  ProtocolError,
  ProtocolUseOptions,
  SDKProtocolResult,
  ShardingParams
} from "./protocols.js";
import type { IReceiver } from "./receiver.js";

export type SubscribeOptions = {
  keepAlive?: number;
  pingsBeforePeerRenewed?: number;
  maxMissedMessagesThreshold?: number;
};

export type IFilter = IReceiver & IBaseProtocolCore;

export interface ISubscriptionSDK {
  subscribe<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[],
    callback: Callback<T>,
    options?: SubscribeOptions
  ): Promise<SDKProtocolResult>;

  unsubscribe(contentTopics: ContentTopic[]): Promise<SDKProtocolResult>;

  ping(peerId?: PeerId): Promise<SDKProtocolResult>;

  unsubscribeAll(): Promise<SDKProtocolResult>;
}

export type IFilterSDK = IReceiver &
  IBaseProtocolSDK & { protocol: IBaseProtocolCore } & {
    createSubscription(
      pubsubTopicShardInfo?: ShardingParams | PubsubTopic,
      options?: ProtocolUseOptions
    ): Promise<CreateSubscriptionResult>;
  };

export type CreateSubscriptionResult = ThisOrThat<
  "subscription",
  ISubscriptionSDK,
  "error",
  ProtocolError
>;
