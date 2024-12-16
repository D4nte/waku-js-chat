import type { Stream } from "@libp2p/interface";
import { isPeerId, PeerId } from "@libp2p/interface";
import { multiaddr, Multiaddr, MultiaddrInput } from "@multiformats/multiaddr";
import { ConnectionManager, getHealthManager, StoreCodec } from "@waku/core";
import type {
  IFilter,
  IHealthManager,
  ILightPush,
  IRelay,
  IStore,
  IWaku,
  Libp2p,
  PeerIdStr,
  ProtocolCreateOptions,
  PubsubTopic
} from "@waku/interfaces";
import { Protocols } from "@waku/interfaces";
import { Logger } from "@waku/utils";

import { wakuFilter } from "../protocols/filter/index.js";
import { wakuLightPush } from "../protocols/light_push/index.js";
import { wakuStore } from "../protocols/store/index.js";
import { ReliabilityMonitorManager } from "../reliability_monitor/index.js";

import { waitForRemotePeer } from "./wait_for_remote_peer.js";

export const DefaultPingKeepAliveValueSecs = 5 * 60;
export const DefaultRelayKeepAliveValueSecs = 5 * 60;
export const DefaultUserAgent = "js-waku";
export const DefaultPingMaxInboundStreams = 10;

const log = new Logger("waku");

export interface WakuOptions {
  /**
   * Set keep alive frequency in seconds: Waku will send a `/ipfs/ping/1.0.0`
   * request to each peer after the set number of seconds. Set to 0 to disable.
   *
   * @default {@link @waku/core.DefaultPingKeepAliveValueSecs}
   */
  pingKeepAlive?: number;
  /**
   * Set keep alive frequency in seconds: Waku will send a ping message over
   * relay to each peer after the set number of seconds. Set to 0 to disable.
   *
   * @default {@link @waku/core.DefaultRelayKeepAliveValueSecs}
   */
  relayKeepAlive?: number;
  /**
   * Set the user agent string to be used in identification of the node.
   * @default {@link @waku/core.DefaultUserAgent}
   */
  userAgent?: string;
}

export type CreateWakuNodeOptions = ProtocolCreateOptions &
  Partial<WakuOptions>;

type ProtocolsEnabled = {
  filter?: boolean;
  lightpush?: boolean;
  store?: boolean;
};

export class WakuNode implements IWaku {
  public libp2p: Libp2p;
  public relay?: IRelay;
  public store?: IStore;
  public filter?: IFilter;
  public lightPush?: ILightPush;
  public connectionManager: ConnectionManager;
  public readonly health: IHealthManager;

  public constructor(
    public readonly pubsubTopics: PubsubTopic[],
    options: CreateWakuNodeOptions,
    libp2p: Libp2p,
    protocolsEnabled: ProtocolsEnabled,
    relay?: IRelay
  ) {
    this.relay = relay;
    this.libp2p = libp2p;

    protocolsEnabled = {
      filter: false,
      lightpush: false,
      store: false,
      ...protocolsEnabled
    };

    const pingKeepAlive =
      options.pingKeepAlive || DefaultPingKeepAliveValueSecs;
    const relayKeepAlive = this.relay
      ? options.relayKeepAlive || DefaultRelayKeepAliveValueSecs
      : 0;

    const peerId = this.libp2p.peerId.toString();

    this.connectionManager = ConnectionManager.create(
      peerId,
      libp2p,
      { pingKeepAlive, relayKeepAlive },
      this.pubsubTopics,
      this.relay
    );

    this.health = getHealthManager();

    if (protocolsEnabled.store) {
      let peerIdStr: PeerIdStr | undefined;
      if (options.store?.peer) {
        this.dialMultiaddr(options.store.peer, StoreCodec).catch((e) => {
          log.error("Failed to dial store peer", e);
        });
      }

      const store = wakuStore(this.connectionManager, peerIdStr);
      this.store = store(libp2p);
    }

    if (protocolsEnabled.lightpush) {
      const lightPush = wakuLightPush(this.connectionManager, options);
      this.lightPush = lightPush(libp2p);
    }

    if (protocolsEnabled.filter) {
      const filter = wakuFilter(
        this.connectionManager,
        this.lightPush,
        options
      );
      this.filter = filter(libp2p);
    }

    log.info(
      "Waku node created",
      peerId,
      `relay: ${!!this.relay}, store: ${!!this.store}, light push: ${!!this
        .lightPush}, filter: ${!!this.filter}`
    );
  }

  public get peerId(): PeerId {
    return this.libp2p.peerId;
  }

  public get protocols(): string[] {
    return this.libp2p.getProtocols();
  }

  public async dial(
    peer: PeerId | MultiaddrInput,
    protocols?: Protocols[]
  ): Promise<Stream> {
    const _protocols = protocols ?? [];
    const peerId = this.mapToPeerIdOrMultiaddr(peer);

    if (typeof protocols === "undefined") {
      this.relay && _protocols.push(Protocols.Relay);
      this.store && _protocols.push(Protocols.Store);
      this.filter && _protocols.push(Protocols.Filter);
      this.lightPush && _protocols.push(Protocols.LightPush);
    }

    const codecs: string[] = [];
    if (_protocols.includes(Protocols.Relay)) {
      if (this.relay) {
        this.relay.gossipSub.multicodecs.forEach((codec: string) =>
          codecs.push(codec)
        );
      } else {
        log.error(
          "Relay codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.Store)) {
      if (this.store) {
        codecs.push(this.store.protocol.multicodec);
      } else {
        log.error(
          "Store codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.LightPush)) {
      if (this.lightPush) {
        codecs.push(this.lightPush.protocol.multicodec);
      } else {
        log.error(
          "Light Push codec not included in dial codec: protocol not mounted locally"
        );
      }
    }
    if (_protocols.includes(Protocols.Filter)) {
      if (this.filter) {
        codecs.push(this.filter.protocol.multicodec);
      } else {
        log.error(
          "Filter codec not included in dial codec: protocol not mounted locally"
        );
      }
    }

    log.info(`Dialing to ${peerId.toString()} with protocols ${_protocols}`);

    return this.libp2p.dialProtocol(peerId, codecs);
  }

  public async start(): Promise<void> {
    await this.libp2p.start();
  }

  public async stop(): Promise<void> {
    ReliabilityMonitorManager.stopAll();
    this.connectionManager.stop();
    await this.libp2p.stop();
  }

  public async waitForPeers(
    protocols?: Protocols[],
    timeoutMs?: number
  ): Promise<void> {
    return waitForRemotePeer(this, protocols, timeoutMs);
  }

  public isStarted(): boolean {
    return this.libp2p.status == "started";
  }

  public isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  private async dialMultiaddr(
    multiaddrStr: string,
    protocol: string
  ): Promise<PeerIdStr> {
    const ma = multiaddr(multiaddrStr);
    if (!ma.getPeerId()) {
      throw new Error("Failed to dial multiaddr: missing peer ID");
    }
    await this.libp2p.dialProtocol(ma, [protocol]);
    return ma.getPeerId()!;
  }

  private mapToPeerIdOrMultiaddr(
    peerId: PeerId | MultiaddrInput
  ): PeerId | Multiaddr {
    return isPeerId(peerId) ? peerId : multiaddr(peerId);
  }
}
