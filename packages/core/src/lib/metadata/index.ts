import type { PeerId } from "@libp2p/interface";
import { IncomingStreamData } from "@libp2p/interface";
import {
  type IMetadata,
  type Libp2pComponents,
  type MetadataQueryResult,
  type PeerIdStr,
  ProtocolError,
  type ShardInfo
} from "@waku/interfaces";
import { proto_metadata } from "@waku/proto";
import { encodeRelayShard, Logger, shardInfoToPubsubTopics } from "@waku/utils";
import all from "it-all";
import * as lp from "it-length-prefixed";
import { pipe } from "it-pipe";
import { Uint8ArrayList } from "uint8arraylist";

import { BaseProtocol } from "../base_protocol.js";

const log = new Logger("metadata");

export const MetadataCodec = "/vac/waku/metadata/1.0.0";

class Metadata extends BaseProtocol implements IMetadata {
  private libp2pComponents: Libp2pComponents;
  handshakesConfirmed: Map<PeerIdStr, ShardInfo> = new Map();

  constructor(
    public shardInfo: ShardInfo,
    libp2p: Libp2pComponents
  ) {
    super(
      MetadataCodec,
      libp2p.components,
      log,
      shardInfoToPubsubTopics(shardInfo)
    );
    this.libp2pComponents = libp2p;
    void libp2p.registrar.handle(MetadataCodec, (streamData) => {
      void this.onRequest(streamData);
    });
  }

  /**
   * Handle an incoming metadata request
   */
  private async onRequest(streamData: IncomingStreamData): Promise<void> {
    try {
      const { stream, connection } = streamData;
      const encodedShardInfo = proto_metadata.WakuMetadataResponse.encode(
        this.shardInfo
      );

      const encodedResponse = await pipe(
        [encodedShardInfo],
        lp.encode,
        stream,
        lp.decode,
        async (source) => await all(source)
      );

      const { error, shardInfo } = this.decodeMetadataResponse(encodedResponse);

      if (error) {
        return;
      }

      await this.savePeerShardInfo(connection.remotePeer, shardInfo);
    } catch (error) {
      log.error("Error handling metadata request", error);
    }
  }

  /**
   * Make a metadata query to a peer
   */
  async query(peerId: PeerId): Promise<MetadataQueryResult> {
    const request = proto_metadata.WakuMetadataRequest.encode(this.shardInfo);

    const peer = await this.peerStore.get(peerId);
    if (!peer) {
      return {
        shardInfo: null,
        error: ProtocolError.NO_PEER_AVAILABLE
      };
    }

    const stream = await this.getStream(peer);

    const encodedResponse = await pipe(
      [request],
      lp.encode,
      stream,
      lp.decode,
      async (source) => await all(source)
    );

    const { error, shardInfo } = this.decodeMetadataResponse(encodedResponse);

    if (error) {
      return {
        shardInfo: null,
        error
      };
    }

    await this.savePeerShardInfo(peerId, shardInfo);

    return {
      shardInfo,
      error: null
    };
  }

  public async confirmOrAttemptHandshake(
    peerId: PeerId
  ): Promise<MetadataQueryResult> {
    const shardInfo = this.handshakesConfirmed.get(peerId.toString());
    if (shardInfo) {
      return {
        shardInfo,
        error: null
      };
    }

    return await this.query(peerId);
  }

  private decodeMetadataResponse(
    encodedResponse: Uint8ArrayList[]
  ): MetadataQueryResult {
    const bytes = new Uint8ArrayList();

    encodedResponse.forEach((chunk) => {
      bytes.append(chunk);
    });
    const response = proto_metadata.WakuMetadataResponse.decode(
      bytes
    ) as ShardInfo;

    if (!response) {
      log.error("Error decoding metadata response");
      return {
        shardInfo: null,
        error: ProtocolError.DECODE_FAILED
      };
    }

    return {
      shardInfo: response,
      error: null
    };
  }

  private async savePeerShardInfo(
    peerId: PeerId,
    shardInfo: ShardInfo
  ): Promise<void> {
    // add or update the shardInfo to peer store
    await this.libp2pComponents.peerStore.merge(peerId, {
      metadata: {
        shardInfo: encodeRelayShard(shardInfo)
      }
    });

    this.handshakesConfirmed.set(peerId.toString(), shardInfo);
  }
}

export function wakuMetadata(
  shardInfo: ShardInfo
): (components: Libp2pComponents) => IMetadata {
  return (components: Libp2pComponents) => new Metadata(shardInfo, components);
}
