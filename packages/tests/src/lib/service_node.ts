import type { PeerId } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import { Multiaddr, multiaddr } from "@multiformats/multiaddr";
import { DefaultPubsubTopic } from "@waku/interfaces";
import { isDefined } from "@waku/utils";
import { Logger } from "@waku/utils";
import { bytesToHex, hexToBytes } from "@waku/utils/bytes";
import pRetry from "p-retry";
import portfinder from "portfinder";

import {
  Args,
  KeyPair,
  LogLevel,
  MessageRpcQuery,
  MessageRpcResponse,
  Ports
} from "../types.js";
import { existsAsync, mkdirAsync, openAsync } from "../utils/async_fs.js";
import { delay } from "../utils/delay.js";
import waitForLine from "../utils/log_file.js";

import Dockerode from "./dockerode.js";

const log = new Logger("test:node");

const WAKU_SERVICE_NODE_PARAMS =
  process.env.WAKU_SERVICE_NODE_PARAMS ?? undefined;
const NODE_READY_LOG_LINE = "Node setup complete";

export const DOCKER_IMAGE_NAME =
  process.env.WAKUNODE_IMAGE || "wakuorg/nwaku:v0.24.0";

const isGoWaku = DOCKER_IMAGE_NAME.includes("go-waku");

const LOG_DIR = "./log";

const OneMillion = BigInt(1_000_000);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function toJSON() {
  return Number(this);
};

export class ServiceNode {
  private docker?: Dockerode;
  private peerId?: PeerId;
  private multiaddrWithId?: Multiaddr;
  private websocketPort?: number;
  private readonly logPath: string;
  private rpcPort?: number;
  private restPort?: number;

  /**
   * Convert a [[WakuMessage]] to a [[WakuRelayMessage]]. The latter is used
   * by the nwaku JSON-RPC API.
   */
  static toMessageRpcQuery(message: {
    payload: Uint8Array;
    contentTopic: string;
    timestamp?: Date;
  }): MessageRpcQuery {
    if (!message.payload) {
      throw "Attempting to convert empty message";
    }

    let timestamp;
    if (message.timestamp) {
      timestamp = BigInt(message.timestamp.valueOf()) * OneMillion;
    }

    return {
      payload: Buffer.from(message.payload).toString("base64"),
      contentTopic: message.contentTopic,
      timestamp
    };
  }

  constructor(logName: string) {
    this.logPath = `${LOG_DIR}/wakunode_${logName}.log`;
  }

  get type(): "go-waku" | "nwaku" {
    return isGoWaku ? "go-waku" : "nwaku";
  }

  get nodeType(): "go-waku" | "nwaku" {
    return isGoWaku ? "go-waku" : "nwaku";
  }

  async start(
    args: Args = {},
    options: {
      retries?: number;
    } = { retries: 3 }
  ): Promise<void> {
    await pRetry(
      async () => {
        try {
          this.docker = await Dockerode.createInstance(DOCKER_IMAGE_NAME);
          try {
            await existsAsync(LOG_DIR);
          } catch (e) {
            try {
              await mkdirAsync(LOG_DIR);
            } catch (e) {
              // Looks like 2 tests tried to create the director at the same time,
              // it can be ignored
            }
          }

          await openAsync(this.logPath, "w");

          const mergedArgs = defaultArgs();

          // waku nodes takes some time to bind port so to decrease chances of conflict
          // we also randomize the first port that portfinder will try
          const startPort = Math.floor(Math.random() * (65535 - 1025) + 1025);

          const ports: Ports = await new Promise((resolve, reject) => {
            portfinder.getPorts(5, { port: startPort }, (err, ports) => {
              if (err) reject(err);
              resolve({
                rpcPort: ports[0],
                tcpPort: ports[1],
                websocketPort: ports[2],
                restPort: ports[3],
                discv5UdpPort: ports[4]
              });
            });
          });

          if (isGoWaku && !args.logLevel) {
            args.logLevel = LogLevel.Debug;
          }

          const { rpcPort, tcpPort, websocketPort, restPort, discv5UdpPort } =
            ports;
          this.restPort = restPort;
          this.rpcPort = rpcPort;
          this.websocketPort = websocketPort;

          // `legacyFilter` is required to enable filter v1 with go-waku
          const { legacyFilter = false, ..._args } = args;

          // Object.assign overrides the properties with the source (if there are conflicts)
          Object.assign(
            mergedArgs,
            {
              rest: true,
              restPort,
              rpcPort,
              tcpPort,
              websocketPort,
              ...(args?.peerExchange && { discv5UdpPort }),
              ...(isGoWaku && { minRelayPeersToPublish: 0, legacyFilter })
            },
            { rpcAddress: "0.0.0.0", restAddress: "0.0.0.0" },
            _args
          );

          process.env.WAKUNODE2_STORE_MESSAGE_DB_URL = "";

          if (this.docker.container) {
            await this.docker.stop();
          }

          await this.docker?.startContainer(
            ports,
            mergedArgs,
            this.logPath,
            WAKU_SERVICE_NODE_PARAMS
          );
        } catch (error) {
          log.error("Nwaku node failed to start:", error);
          await this.stop();
          throw error;
        }
        try {
          log.info(
            `Waiting to see '${NODE_READY_LOG_LINE}' in ${this.type} logs`
          );
          await this.waitForLog(NODE_READY_LOG_LINE, 15000);
          if (process.env.CI) await delay(100);
          log.info(`${this.type} node has been started`);
        } catch (error) {
          log.error(`Error starting ${this.type}: ${error}`);
          if (this.docker.container) await this.docker.stop();
          throw error;
        }
      },
      { retries: options.retries }
    );
  }

  public async stop(): Promise<void> {
    await this.docker?.stop();
    delete this.docker;
  }

  async waitForLog(msg: string, timeout: number): Promise<void> {
    return waitForLine(this.logPath, msg, timeout);
  }

  /** Calls nwaku JSON-RPC API `get_waku_v2_admin_v1_peers` to check
   * for known peers
   * @throws if WakuNode isn't started.
   */
  async peers(): Promise<string[]> {
    this.checkProcess();

    return this.rpcCall<string[]>("get_waku_v2_admin_v1_peers", []);
  }

  async info(): Promise<RpcInfoResponse> {
    this.checkProcess();

    return this.rpcCall<RpcInfoResponse>("get_waku_v2_debug_v1_info", []);
  }

  async ensureSubscriptions(
    pubsubTopics: string[] = [DefaultPubsubTopic]
  ): Promise<boolean> {
    return this.restCall<boolean>(
      "/relay/v1/subscriptions",
      "POST",
      pubsubTopics,
      async (response) => response.status === 200
    );
  }

  async messages(
    pubsubTopic: string = DefaultPubsubTopic
  ): Promise<MessageRpcResponse[]> {
    pubsubTopic = encodeURIComponent(pubsubTopic);
    return this.restCall<MessageRpcResponse[]>(
      `/relay/v1/messages/${pubsubTopic}`,
      "GET",
      null,
      async (response) => {
        const data = await response.json();
        return data?.length ? data : [];
      }
    );
  }

  async ensureSubscriptionsAutosharding(
    contentTopics: string[]
  ): Promise<boolean> {
    this.checkProcess();

    return this.restCall<boolean>(
      "/relay/v1/subscriptions",
      "POST",
      contentTopics,
      async (response) => response.status === 200
    );
  }

  async sendMessage(
    message: MessageRpcQuery,
    pubsubTopic: string = DefaultPubsubTopic
  ): Promise<boolean> {
    this.checkProcess();

    if (typeof message.timestamp === "undefined") {
      message.timestamp = BigInt(new Date().valueOf()) * OneMillion;
    }

    return this.rpcCall<boolean>("post_waku_v2_relay_v1_message", [
      pubsubTopic,
      message
    ]);
  }

  async sendMessageAutosharding(message: MessageRpcQuery): Promise<boolean> {
    this.checkProcess();

    if (typeof message.timestamp === "undefined") {
      message.timestamp = BigInt(new Date().valueOf()) * OneMillion;
    }

    return this.rpcCall<boolean>("post_waku_v2_relay_v1_auto_message", [
      message
    ]);
  }

  async messagesAutosharding(
    contentTopic: string
  ): Promise<MessageRpcResponse[]> {
    this.checkProcess();

    contentTopic = encodeURIComponent(contentTopic);
    return this.restCall<MessageRpcResponse[]>(
      `/relay/v1/auto/messages/${contentTopic}`,
      "GET",
      null,
      async (response) => {
        const data = await response.json();
        return data?.length ? data.filter(isDefined) : [];
      }
    );
  }

  async getAsymmetricKeyPair(): Promise<KeyPair> {
    this.checkProcess();

    const { privateKey, publicKey, seckey, pubkey } = await this.rpcCall<{
      seckey: string;
      pubkey: string;
      privateKey: string;
      publicKey: string;
    }>("get_waku_v2_private_v1_asymmetric_keypair", []);

    // To be removed once https://github.com/vacp2p/rfc/issues/507 is fixed
    if (seckey) {
      return { privateKey: seckey, publicKey: pubkey };
    } else {
      return { privateKey, publicKey };
    }
  }

  async postAsymmetricMessage(
    message: MessageRpcQuery,
    publicKey: Uint8Array,
    pubsubTopic?: string
  ): Promise<boolean> {
    this.checkProcess();

    if (!message.payload) {
      throw "Attempting to send empty message";
    }

    return this.rpcCall<boolean>("post_waku_v2_private_v1_asymmetric_message", [
      pubsubTopic ? pubsubTopic : DefaultPubsubTopic,
      message,
      "0x" + bytesToHex(publicKey)
    ]);
  }

  async getAsymmetricMessages(
    privateKey: Uint8Array,
    pubsubTopic?: string
  ): Promise<MessageRpcResponse[]> {
    this.checkProcess();

    return await this.rpcCall<MessageRpcResponse[]>(
      "get_waku_v2_private_v1_asymmetric_messages",
      [
        pubsubTopic ? pubsubTopic : DefaultPubsubTopic,
        "0x" + bytesToHex(privateKey)
      ]
    );
  }

  async getSymmetricKey(): Promise<Uint8Array> {
    this.checkProcess();

    return this.rpcCall<string>(
      "get_waku_v2_private_v1_symmetric_key",
      []
    ).then(hexToBytes);
  }

  async postSymmetricMessage(
    message: MessageRpcQuery,
    symKey: Uint8Array,
    pubsubTopic?: string
  ): Promise<boolean> {
    this.checkProcess();

    if (!message.payload) {
      throw "Attempting to send empty message";
    }

    return this.rpcCall<boolean>("post_waku_v2_private_v1_symmetric_message", [
      pubsubTopic ? pubsubTopic : DefaultPubsubTopic,
      message,
      "0x" + bytesToHex(symKey)
    ]);
  }

  async getSymmetricMessages(
    symKey: Uint8Array,
    pubsubTopic?: string
  ): Promise<MessageRpcResponse[]> {
    this.checkProcess();

    return await this.rpcCall<MessageRpcResponse[]>(
      "get_waku_v2_private_v1_symmetric_messages",
      [
        pubsubTopic ? pubsubTopic : DefaultPubsubTopic,
        "0x" + bytesToHex(symKey)
      ]
    );
  }

  async getPeerId(): Promise<PeerId> {
    if (this.peerId) return this.peerId;
    this.peerId = await this._getPeerId();
    return this.peerId;
  }

  async getMultiaddrWithId(): Promise<Multiaddr> {
    if (this.multiaddrWithId) return this.multiaddrWithId;

    const peerId = await this.getPeerId();

    this.multiaddrWithId = multiaddr(
      `/ip4/127.0.0.1/tcp/${this.websocketPort}/ws/p2p/${peerId.toString()}`
    );
    return this.multiaddrWithId;
  }

  private async _getPeerId(): Promise<PeerId> {
    if (this.peerId) {
      return this.peerId;
    }
    const res = await this.info();
    const multiaddrWithId = res.listenAddresses
      .map((ma) => multiaddr(ma))
      .find((ma) => ma.protoNames().includes("ws"));
    if (!multiaddrWithId) throw `${this.type} did not return a ws multiaddr`;
    const peerIdStr = multiaddrWithId.getPeerId();
    if (!peerIdStr) throw `${this.type} multiaddr does not contain peerId`;
    this.peerId = peerIdFromString(peerIdStr);

    return this.peerId;
  }

  get rpcUrl(): string {
    return `http://127.0.0.1:${this.rpcPort}/`;
  }

  get httpUrl(): string {
    return `http://127.0.0.1:${this.restPort}`;
  }

  async rpcCall<T>(
    method: string,
    params: Array<string | number | unknown>
  ): Promise<T> {
    return await pRetry(
      async () => {
        try {
          log.info("Making an RPC Query: ", method, params);
          const res = await fetch(this.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method,
              params
            }),
            headers: new Headers({ "Content-Type": "application/json" })
          });
          const json = await res.json();
          log.info(`Received RPC Response: `, JSON.stringify(json));
          return json.result;
        } catch (error) {
          log.error(`${this.rpcUrl} failed with error:`, error);
          await delay(10);
          throw error;
        }
      },
      { retries: 5 }
    );
  }

  async restCall<T>(
    endpoint: string,
    method: "GET" | "POST",
    body: any = null,
    processResponse: (response: Response) => Promise<T>
  ): Promise<T> {
    this.checkProcess();

    try {
      log.info("Making a REST Call: ", endpoint, body);
      const options: RequestInit = {
        method,
        headers: new Headers({ "Content-Type": "application/json" })
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`${this.httpUrl}${endpoint}`, options);
      log.info(`Received REST Response: `, response.status);
      return await processResponse(response);
    } catch (error) {
      log.error(`${this.httpUrl} failed with error:`, error);
      throw error;
    }
  }

  private checkProcess(): void {
    if (!this.docker?.container) {
      throw `${this.type} container hasn't started`;
    }
  }
}

export function defaultArgs(): Args {
  return {
    listenAddress: "0.0.0.0",
    rpc: true,
    relay: false,
    rest: true,
    rpcAdmin: true,
    websocketSupport: true,
    logLevel: LogLevel.Trace
  };
}

interface RpcInfoResponse {
  // multiaddrs including peer id.
  listenAddresses: string[];
  enrUri?: string;
}