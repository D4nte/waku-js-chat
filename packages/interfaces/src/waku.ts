import type { PeerId } from "@libp2p/interface";
import type { MultiaddrInput } from "@multiformats/multiaddr";

import { IConnectionManager } from "./connection_manager.js";
import type { IFilter } from "./filter.js";
import { IHealthManager } from "./health_manager.js";
import type { Libp2p } from "./libp2p.js";
import type { ILightPush } from "./light_push.js";
import { Protocols } from "./protocols.js";
import type { IRelay } from "./relay.js";
import type { IStore } from "./store.js";

export interface IWaku {
  libp2p: Libp2p;
  relay?: IRelay;
  store?: IStore;
  filter?: IFilter;
  lightPush?: ILightPush;

  health: IHealthManager;
  connectionManager: IConnectionManager;

  /**
   * Returns a unique identifier for a node on the network.
   *
   * @example
   * ```typescript
   * console.log(waku.peerId); // 12D3KooWNmk9yXHfHJ4rUduRqD1TCTHkNFMPF9WP2dqWpZDL4aUb
   * ```
   */
  peerId: PeerId;

  /**
   * Returns a list of supported protocols.
   *
   * @example
   * ```typescript
   * console.log(waku.protocols); // ['/ipfs/id/1.0.0', '/ipfs/ping/1.0.0', '/vac/waku/filter-push/2.0.0-beta1', '/vac/waku/metadata/1.0.0']
   * ```
   */
  protocols: string[];

  /**
   * Dials to the provided peer
   *
   * @param {PeerId | MultiaddrInput} peer information to use for dialing
   * @param {Protocols[]} [protocols] array of Waku protocols to be used for dialing. If no provided - will be derived from mounted protocols.
   *
   * @returns {Promise<Stream>} `Promise` that will resolve to a `Stream` to a dialed peer
   *
   * @example
   * ```typescript
   * await waku.dial(remotePeerId, [Protocols.LightPush]);
   *
   * waku.isConnected() === true;
   * ```
   */
  dial(peer: PeerId | MultiaddrInput, protocols?: Protocols[]): Promise<void>;

  /**
   * Starts all services and components related to functionality of Waku node.
   *
   * @returns {Promise<boolean>} `Promise` that will resolve when started.
   *
   * @example
   * ```typescript
   * await waku.start();
   *
   * waku.isStarted() === true;
   * ```
   */
  start(): Promise<void>;

  /**
   * Stops all recurring processes and services that are needed for functionality of Waku node.
   *
   * @returns {Promise<boolean>} `Promise` that resolves when stopped.
   *
   * @example
   * ```typescript
   * await waku.stop();
   *
   * waku.isStarted === false;
   * ```
   */
  stop(): Promise<void>;

  /**
   * Resolves when Waku successfully gains connection to a remote peers that fits provided requirements.
   * Must be used after attempting to connect to nodes, using {@link IWaku.dial} or
   * if was bootstrapped by using {@link IPeerExchange} or {@link DnsDiscoveryComponents}.
   *
   * @param {Protocols[]} [protocols] Protocols that need to be enabled by remote peers
   * @param {number} [timeoutMs] Timeout value in milliseconds after which promise rejects
   *
   * @returns {Promise<void>} `Promise` that **resolves** if all desired protocols are fulfilled by
   * at least one remote peer, **rejects** if the timeoutMs is reached
   * @throws If passing a protocol that is not mounted or Waku node is not started
   *
   * @example
   * ```typescript
   * try {
   *  // let's wait for at least one LightPush node and timeout in 1 second
   *  await waku.waitForPeers([Protocols.LightPush], 1000);
   * } catch(e) {
   *  waku.isConnected() === false;
   *  console.error("Failed to connect due to", e);
   * }
   *
   * waku.isConnected() === true;
   * ```
   */
  waitForPeers(protocols?: Protocols[], timeoutMs?: number): Promise<void>;

  /**
   * @returns {boolean} `true` if the node was started and `false` otherwise
   */
  isStarted(): boolean;

  /**
   * @returns {boolean} `true` if the node has working connection and `false` otherwise
   */
  isConnected(): boolean;
}

export interface LightNode extends IWaku {
  relay: undefined;
  store: IStore;
  filter: IFilter;
  lightPush: ILightPush;
}

export interface RelayNode extends IWaku {
  relay: IRelay;
  store: undefined;
  filter: undefined;
  lightPush: undefined;
}
