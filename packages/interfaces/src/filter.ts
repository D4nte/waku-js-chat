import type { PeerId } from "@libp2p/interface-peer-id";

import type { IDecodedMessage, IDecoder } from "./message.js";
import type { ContentTopic } from "./misc.js";
import type { Callback, IBaseProtocol } from "./protocols.js";
import type { IReceiver } from "./receiver.js";

export type ContentFilter = {
  contentTopic: string;
};

export type IFilter = IReceiver & IBaseProtocol;

export interface IFilterV2Subscription {
  subscribe<T extends IDecodedMessage>(
    decoders: IDecoder<T> | IDecoder<T>[],
    callback: Callback<T>
  ): Promise<void>;

  unsubscribe(contentTopics: ContentTopic[]): Promise<void>;

  ping(): Promise<void>;

  unsubscribeAll(): Promise<void>;
}

export type IFilterV2 = IReceiver &
  IBaseProtocol & {
    createSubscription(
      pubSubTopic?: string,
      peerId?: PeerId
    ): Promise<IFilterV2Subscription>;
  };
