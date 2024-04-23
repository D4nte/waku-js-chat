import type { PeerId } from "@libp2p/interface";
import type { PeerStore } from "@libp2p/interface";
import type { ConnectionManager } from "@libp2p/interface-internal";

import { IEnr } from "./enr.js";
import { IBaseProtocolCore, ResultWithError } from "./protocols.js";

export interface IPeerExchange extends IBaseProtocolCore {
  query(params: PeerExchangeQueryParams): Promise<PeerExchangeQueryResult>;
}

export type PeerExchangeQueryResult = ResultWithError<"peerInfos", PeerInfo[]>;

export interface PeerExchangeQueryParams {
  numPeers: number;
  peerId: PeerId;
}

export interface PeerExchangeResponse {
  peerInfos: PeerInfo[];
}

export interface PeerInfo {
  ENR?: IEnr;
}

export interface PeerExchangeComponents {
  connectionManager: ConnectionManager;
  peerStore: PeerStore;
}
