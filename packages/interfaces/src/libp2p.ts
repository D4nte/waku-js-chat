import type { GossipSub } from "@chainsafe/libp2p-gossipsub";
import type { identify } from "@libp2p/identify";
import type { Libp2p as BaseLibp2p } from "@libp2p/interface";
import type { PingService } from "@libp2p/ping";
import type { Libp2pInit, Libp2pOptions } from "libp2p";

import { IMetadata } from "./metadata.js";

export type Libp2pServices = {
  ping: PingService;
  metadata?: IMetadata;
  pubsub?: GossipSub;
  identify: ReturnType<ReturnType<typeof identify>>;
};

// TODO: Get libp2p to export this.
export type Libp2pComponents = Parameters<
  Exclude<Libp2pInit["metrics"], undefined>
>[0];

// thought components are not defined on the Libp2p interface they are present on Libp2pNode class
export type Libp2p = BaseLibp2p<Libp2pServices> & {
  components: Libp2pComponents;
};

export type CreateLibp2pOptions = Libp2pOptions & {
  /**
   * Hides WebSocket info message in console.
   * @default false
   */
  hideWebSocketInfo?: boolean;
  pingMaxInboundStreams?: number;
  /**
   * Applies secure web socket filters.
   * @default true
   */
  filterMultiaddrs?: boolean;
};
