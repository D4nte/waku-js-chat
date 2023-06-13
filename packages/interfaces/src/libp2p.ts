import type { GossipSub } from "@chainsafe/libp2p-gossipsub";
import type { Libp2p as BaseLibp2p } from "@libp2p/interface-libp2p";
import type { Libp2pInit } from "libp2p";
import type { identifyService } from "libp2p/identify";
import type { PingService } from "libp2p/ping";

export type Libp2pServices = {
  ping: PingService;
  pubsub?: GossipSub;
  identify: ReturnType<ReturnType<typeof identifyService>>;
};

export type Libp2p = BaseLibp2p<Libp2pServices>;

// TODO: Get libp2p to export this.
export type Libp2pComponents = Parameters<
  Exclude<Libp2pInit["metrics"], undefined>
>[0];
