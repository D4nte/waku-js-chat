import { DecodedMessage } from "@waku/core";
import { NetworkConfig } from "@waku/interfaces";
import { derivePubsubTopicsFromNetworkConfig, Logger } from "@waku/utils";
import { expect } from "chai";

import { DefaultTestPubsubTopic } from "../constants.js";
import { Args, MessageRpcQuery, MessageRpcResponse } from "../types.js";
import { delay, makeLogFileName } from "../utils/index.js";

import { MessageCollector } from "./message_collector.js";
import { runNodes } from "./runNodes.js";
import { defaultArgs, ServiceNode } from "./service_node.js";

export { ServiceNode, MessageCollector, defaultArgs };
export { runNodes };

const log = new Logger("test:message-collector");

/**
 * This class is a wrapper over the ServiceNode & MessageCollector class
 * that allows for the creation & handling of multiple ServiceNodes
 */
export class ServiceNodesFleet {
  public static async createAndRun(
    mochaContext: Mocha.Context,
    nodesToCreate: number = 3,
    strictChecking: boolean = false,
    networkConfig: NetworkConfig,
    _args?: Args,
    withoutFilter = false
  ): Promise<ServiceNodesFleet> {
    const nodes: ServiceNode[] = [];

    for (let index = 0; index < nodesToCreate; index++) {
      const node = new ServiceNode(
        makeLogFileName(mochaContext) + Math.random().toString(36).substring(7)
      );

      const args = getArgs(networkConfig, _args);

      // If this is not the first node and previous node had a nodekey, use its multiaddr as static node
      if (index > 0) {
        const prevNode = nodes[index - 1];
        const multiaddr = await prevNode.getExternalWebsocketMultiaddr();
        args.staticnode = multiaddr;
      }

      await node.start(args, {
        retries: 3
      });

      nodes.push(node);
    }
    return new ServiceNodesFleet(nodes, withoutFilter, strictChecking);
  }

  /**
   * Convert a [[WakuMessage]] to a [[WakuRelayMessage]]. The latter is used
   * by the nwaku JSON-RPC API.
   */
  public static toMessageRpcQuery(message: {
    payload: Uint8Array;
    contentTopic: string;
    timestamp?: Date;
  }): MessageRpcQuery {
    return ServiceNode.toMessageRpcQuery(message);
  }

  public messageCollector: MultipleNodesMessageCollector;
  private constructor(
    public nodes: ServiceNode[],
    relay: boolean,
    private strictChecking: boolean
  ) {
    const _messageCollectors: MessageCollector[] = [];
    this.nodes.forEach((node) => {
      _messageCollectors.push(new MessageCollector(node));
    });
    this.messageCollector = new MultipleNodesMessageCollector(
      _messageCollectors,
      relay ? this.nodes : undefined,
      strictChecking
    );
  }

  public get type(): "go-waku" | "nwaku" {
    const nodeType = new Set(
      this.nodes.map((node) => {
        return node.type;
      })
    );
    if (nodeType.size > 1) {
      throw new Error("Multiple node types");
    }
    return nodeType.values().next().value;
  }

  public async start(): Promise<void> {
    const startPromises = this.nodes.map((node) => node.start());
    await Promise.all(startPromises);
  }

  public async sendRelayMessage(
    message: MessageRpcQuery,
    pubsubTopic: string = DefaultTestPubsubTopic
  ): Promise<boolean> {
    const relayMessagePromises: Promise<boolean>[] = this.nodes.map((node) =>
      node.sendMessage(message, pubsubTopic)
    );
    const relayMessages = await Promise.all(relayMessagePromises);
    return relayMessages.every((message) => message);
  }

  public async confirmMessageLength(numMessages: number): Promise<void> {
    if (this.strictChecking) {
      await Promise.all(
        this.nodes.map(async (node) =>
          expect(await node.messages()).to.have.length(numMessages)
        )
      );
    } else {
      // Wait for all promises to resolve and check if any meets the condition
      const results = await Promise.all(
        this.nodes.map(async (node) => {
          const msgs = await node.messages();
          return msgs.length === numMessages;
        })
      );

      // Check if at least one result meets the condition
      const conditionMet = results.some((result) => result);
      expect(conditionMet).to.be.true;
    }
  }
}

class MultipleNodesMessageCollector {
  public callback: (msg: DecodedMessage) => void = () => {};
  protected messageList: Array<DecodedMessage> = [];
  public constructor(
    private messageCollectors: MessageCollector[],
    private relayNodes?: ServiceNode[],
    private strictChecking: boolean = false
  ) {
    this.callback = (msg: DecodedMessage): void => {
      log.info("Got a message");
      this.messageList.push(msg);
    };
  }

  public get count(): number {
    return this.messageList.length;
  }

  public hasMessage(topic: string, text: string): boolean {
    if (this.strictChecking) {
      return this.messageCollectors.every((collector) =>
        collector.hasMessage(topic, text)
      );
    } else {
      return this.messageCollectors.some((collector) =>
        collector.hasMessage(topic, text)
      );
    }
  }

  public getMessage(index: number): MessageRpcResponse | DecodedMessage {
    return this.messageList[index];
  }

  /**
   * Verifies a received message against expected values on all nodes.
   * Returns true if any node's collector verifies the message successfully.
   */
  public verifyReceivedMessage(
    index: number,
    options: {
      expectedMessageText: string | Uint8Array | undefined;
      expectedContentTopic?: string;
      expectedPubsubTopic?: string;
      expectedVersion?: number;
      expectedMeta?: Uint8Array;
      expectedEphemeral?: boolean;
      expectedTimestamp?: bigint | number;
      checkTimestamp?: boolean;
    }
  ): boolean {
    if (this.strictChecking) {
      return this.messageCollectors.every((collector, _i) => {
        try {
          collector.verifyReceivedMessage(index, options);
          return true;
        } catch (error) {
          return false;
        }
      });
    } else {
      return this.messageCollectors.some((collector, _i) => {
        try {
          collector.verifyReceivedMessage(index, options);
          return true;
        } catch (error) {
          return false;
        }
      });
    }
  }

  /**
   * Waits for a total number of messages across all nodes.
   */
  public async waitForMessages(
    numMessages: number,
    options?: {
      pubsubTopic?: string;
      timeoutDuration?: number;
      exact?: boolean;
    }
  ): Promise<boolean> {
    const startTime = Date.now();
    const pubsubTopic = options?.pubsubTopic || DefaultTestPubsubTopic;
    const timeoutDuration = options?.timeoutDuration || 400;
    const exact = options?.exact || false;

    while (this.messageList.length < numMessages) {
      if (this.relayNodes) {
        if (this.strictChecking) {
          const results = await Promise.all(
            this.relayNodes.map(async (node) => {
              const msgs = await node.messages(pubsubTopic);
              return msgs.length >= numMessages;
            })
          );
          return results.every((result) => result);
        } else {
          const results = await Promise.all(
            this.relayNodes.map(async (node) => {
              const msgs = await node.messages(pubsubTopic);
              return msgs.length >= numMessages;
            })
          );
          return results.some((result) => result);
        }
      }

      const elapsed = Date.now() - startTime;
      if (elapsed > timeoutDuration * numMessages) {
        return false;
      }

      await delay(10);
    }

    if (exact) {
      if (this.messageList.length == numMessages) {
        return true;
      } else {
        log.warn(
          `Was expecting exactly ${numMessages} messages. Received: ${this.messageList.length}`
        );
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * Waits for a total number of messages across all nodes using autosharding.
   */
  public async waitForMessagesAutosharding(
    numMessages: number,
    options?: {
      contentTopic: string;
      timeoutDuration?: number;
      exact?: boolean;
    }
  ): Promise<boolean> {
    const startTime = Date.now();
    const timeoutDuration = options?.timeoutDuration || 400;
    const exact = options?.exact || false;

    while (this.messageList.length < numMessages) {
      if (this.relayNodes) {
        if (this.strictChecking) {
          // In strict mode, all nodes must have the messages
          const results = await Promise.all(
            this.messageCollectors.map(async (collector) => {
              return collector.waitForMessagesAutosharding(
                numMessages,
                options
              );
            })
          );
          if (results.every((result) => result)) {
            return true;
          }
        } else {
          // In non-strict mode, at least one node must have the messages
          const results = await Promise.all(
            this.messageCollectors.map(async (collector) => {
              return collector.waitForMessagesAutosharding(
                numMessages,
                options
              );
            })
          );
          if (results.some((result) => result)) {
            return true;
          }
        }

        if (Date.now() - startTime > timeoutDuration * numMessages) {
          return false;
        }

        await delay(10);
      } else {
        // If no relay nodes, just wait for messages in the list
        if (Date.now() - startTime > timeoutDuration * numMessages) {
          return false;
        }
        await delay(10);
      }
    }

    if (exact) {
      if (this.messageList.length == numMessages) {
        return true;
      } else {
        log.warn(
          `Was expecting exactly ${numMessages} messages. Received: ${this.messageList.length}`
        );
        return false;
      }
    } else {
      return true;
    }
  }
}

function getArgs(networkConfig: NetworkConfig, args?: Args): Args {
  const pubsubTopics = derivePubsubTopicsFromNetworkConfig(networkConfig);
  const defaultArgs = {
    lightpush: true,
    filter: true,
    discv5Discovery: true,
    peerExchange: true,
    relay: true,
    pubsubTopic: pubsubTopics,
    clusterId: networkConfig.clusterId
  } as Args;

  return { ...defaultArgs, ...args };
}
