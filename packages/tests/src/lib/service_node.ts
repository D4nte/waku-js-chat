import type { PeerId } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
import { Multiaddr, multiaddr } from "@multiformats/multiaddr";
import { isDefined } from "@waku/utils";
import { Logger } from "@waku/utils";
import pRetry from "p-retry";
import portfinder from "portfinder";

import { DefaultTestPubsubTopic } from "../constants.js";
import {
  Args,
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
  process.env.WAKUNODE_IMAGE || "wakuorg/nwaku:v0.34.0";

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
  private restPort?: number;
  private args?: Args;

  /**
   * Convert a [[WakuMessage]] to a [[WakuRelayMessage]]. The latter is used
   * by the nwaku JSON-RPC API.
   */
  public static toMessageRpcQuery(message: {
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

  public constructor(logName: string) {
    this.logPath = `${LOG_DIR}/wakunode_${logName}.log`;
  }

  public get type(): "go-waku" | "nwaku" {
    return isGoWaku ? "go-waku" : "nwaku";
  }

  public get nodeType(): "go-waku" | "nwaku" {
    return isGoWaku ? "go-waku" : "nwaku";
  }

  public get containerName(): string | undefined {
    return this.docker?.container?.id;
  }

  public async start(
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
          // depending on getPorts count adjust the random function in such a way that max port is 65535
          const startPort = Math.floor(Math.random() * (65530 - 1025) + 1025);

          const ports: Ports = await new Promise((resolve, reject) => {
            portfinder.getPorts(4, { port: startPort }, (err, ports) => {
              if (err) reject(err);
              resolve({
                tcpPort: ports[0],
                websocketPort: ports[1],
                restPort: ports[2],
                discv5UdpPort: ports[3]
              });
            });
          });

          if (isGoWaku && !args.logLevel) {
            args.logLevel = LogLevel.Debug;
          }

          const { tcpPort, websocketPort, restPort, discv5UdpPort } = ports;
          this.restPort = restPort;
          this.websocketPort = websocketPort;

          // `legacyFilter` is required to enable filter v1 with go-waku
          const { legacyFilter = false, ..._args } = args;

          // Object.assign overrides the properties with the source (if there are conflicts)
          Object.assign(
            mergedArgs,
            {
              rest: true,
              restPort,
              tcpPort,
              websocketPort,
              ...(args?.peerExchange && { discv5UdpPort }),
              ...(isGoWaku && { minRelayPeersToPublish: 0, legacyFilter })
            },
            { restAddress: "0.0.0.0" },
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

          this.args = mergedArgs;
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

  public async waitForLog(msg: string, timeout: number): Promise<void> {
    return waitForLine(this.logPath, msg, timeout);
  }

  /**
   * Calls nwaku REST API "/admin/v1/peers" to check for known peers. Be aware that it doesn't recognize js-waku as a node
   * @throws
   */
  public async peers(): Promise<string[]> {
    this.checkProcess();

    return this.restCall<string[]>(
      "/admin/v1/peers",
      "GET",
      undefined,
      async (response) => {
        const data = await response.json();
        return data?.length ? data : [];
      }
    );
  }

  public async info(): Promise<RpcInfoResponse> {
    this.checkProcess();

    return this.restCall<RpcInfoResponse>(
      "/debug/v1/info",
      "GET",
      undefined,
      async (response) => await response.json()
    );
  }

  public async healthy(): Promise<boolean> {
    this.checkProcess();

    return this.restCall<boolean>(
      "/health",
      "GET",
      undefined,
      async (response) => response.status === 200
    );
  }

  public async ensureSubscriptions(
    pubsubTopics: string[] = [DefaultTestPubsubTopic]
  ): Promise<boolean> {
    return this.restCall<boolean>(
      "/relay/v1/subscriptions",
      "POST",
      pubsubTopics,
      async (response) => response.status === 200
    );
  }

  public async messages(pubsubTopic?: string): Promise<MessageRpcResponse[]> {
    return this.restCall<MessageRpcResponse[]>(
      `/relay/v1/messages/${encodeURIComponent(pubsubTopic || this?.args?.pubsubTopic?.[0] || DefaultTestPubsubTopic)}`,
      "GET",
      null,
      async (response) => {
        const data = await response.json();
        return data?.length ? data : [];
      }
    );
  }

  public async ensureSubscriptionsAutosharding(
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

  public async sendMessage(
    message: MessageRpcQuery,
    pubsubTopic?: string
  ): Promise<boolean> {
    this.checkProcess();

    if (typeof message.timestamp === "undefined") {
      message.timestamp = BigInt(new Date().valueOf()) * OneMillion;
    }

    return this.restCall<boolean>(
      `/relay/v1/messages/${encodeURIComponent(pubsubTopic || this.args?.pubsubTopic?.[0] || DefaultTestPubsubTopic)}`,
      "POST",
      message,
      async (response) => response.status === 200
    );
  }

  public async sendMessageAutosharding(
    message: MessageRpcQuery
  ): Promise<boolean> {
    this.checkProcess();

    if (typeof message.timestamp === "undefined") {
      message.timestamp = BigInt(new Date().valueOf()) * OneMillion;
    }

    return this.restCall<boolean>(
      `/relay/v1/auto/messages`,
      "POST",
      message,
      async (response) => response.status === 200
    );
  }

  public async messagesAutosharding(
    contentTopic: string
  ): Promise<MessageRpcResponse[]> {
    this.checkProcess();

    return this.restCall<MessageRpcResponse[]>(
      `/relay/v1/auto/messages/${encodeURIComponent(contentTopic)}`,
      "GET",
      null,
      async (response) => {
        const data = await response.json();
        return data?.length ? data.filter(isDefined) : [];
      }
    );
  }

  public async getPeerId(): Promise<PeerId> {
    if (this.peerId) return this.peerId;
    this.peerId = await this._getPeerId();
    return this.peerId;
  }

  public async getMultiaddrWithId(): Promise<Multiaddr> {
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

  public get httpUrl(): string {
    return `http://127.0.0.1:${this.restPort}`;
  }

  public get pubsubTopics(): string[] {
    return this.args?.pubsubTopic ?? [];
  }

  public async restCall<T>(
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

  public async getExternalWebsocketMultiaddr(): Promise<string | undefined> {
    if (!this.docker?.container) {
      return undefined;
    }
    const containerIp = this.docker.containerIp;
    const peerId = await this.getPeerId();
    return `/ip4/${containerIp}/tcp/${this.websocketPort}/ws/p2p/${peerId}`;
  }
}

export function defaultArgs(): Args {
  return {
    listenAddress: "0.0.0.0",
    relay: false,
    rest: true,
    restAdmin: true,
    websocketSupport: true,
    logLevel: LogLevel.Trace,
    clusterId: 0,
    shard: [0]
  };
}

interface RpcInfoResponse {
  // multiaddrs including peer id.
  listenAddresses: string[];
  enrUri?: string;
}

export async function verifyServiceNodesConnected(
  nodes: ServiceNode[]
): Promise<void> {
  for (const node of nodes) {
    const peers = await node.peers();
    log.info(`Service node ${node.containerName} peers:`, peers.length);
    log.info(`Service node ${node.containerName} peers:`, peers);

    if (nodes.length > 1 && peers.length === 0) {
      log.error(`Service node ${node.containerName} has no peers connected`);
      throw new Error(
        `Service node ${node.containerName} has no peers connected`
      );
    }
  }
}
