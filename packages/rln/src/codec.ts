import type {
  IDecodedMessage,
  IDecoder,
  IEncoder,
  IMessage,
  IProtoMessage,
  IRateLimitProof
} from "@waku/interfaces";
import { Logger } from "@waku/utils";

import type { IdentityCredential } from "./identity.js";
import { RlnMessage, toRLNSignal } from "./message.js";
import { RLNInstance } from "./rln.js";

const log = new Logger("waku:rln:encoder");

export class RLNEncoder implements IEncoder {
  private readonly idSecretHash: Uint8Array;

  public constructor(
    private readonly encoder: IEncoder,
    private readonly rlnInstance: RLNInstance,
    private readonly index: number,
    identityCredential: IdentityCredential
  ) {
    if (index < 0) throw new Error("Invalid membership index");
    this.idSecretHash = identityCredential.IDSecretHash;
  }

  public async toWire(message: IMessage): Promise<Uint8Array | undefined> {
    message.rateLimitProof = await this.generateProof(message);
    log.info("Proof generated", message.rateLimitProof);
    return this.encoder.toWire(message);
  }

  public async toProtoObj(
    message: IMessage
  ): Promise<IProtoMessage | undefined> {
    const protoMessage = await this.encoder.toProtoObj(message);
    if (!protoMessage) return;

    protoMessage.contentTopic = this.contentTopic;
    protoMessage.rateLimitProof = await this.generateProof(message);
    log.info("Proof generated", protoMessage.rateLimitProof);
    return protoMessage;
  }

  private async generateProof(message: IMessage): Promise<IRateLimitProof> {
    const signal = toRLNSignal(this.contentTopic, message);
    const proof = await this.rlnInstance.zerokit.generateRLNProof(
      signal,
      this.index,
      message.timestamp,
      this.idSecretHash
    );
    return proof;
  }

  public get pubsubTopic(): string {
    return this.encoder.pubsubTopic;
  }

  public get contentTopic(): string {
    return this.encoder.contentTopic;
  }

  public get ephemeral(): boolean {
    return this.encoder.ephemeral;
  }
}

type RLNEncoderOptions = {
  encoder: IEncoder;
  rlnInstance: RLNInstance;
  index: number;
  credential: IdentityCredential;
};

export const createRLNEncoder = (options: RLNEncoderOptions): RLNEncoder => {
  return new RLNEncoder(
    options.encoder,
    options.rlnInstance,
    options.index,
    options.credential
  );
};

export class RLNDecoder<T extends IDecodedMessage>
  implements IDecoder<RlnMessage<T>>
{
  public constructor(
    private readonly rlnInstance: RLNInstance,
    private readonly decoder: IDecoder<T>
  ) {}

  public get pubsubTopic(): string {
    return this.decoder.pubsubTopic;
  }

  public get contentTopic(): string {
    return this.decoder.contentTopic;
  }

  public fromWireToProtoObj(
    bytes: Uint8Array
  ): Promise<IProtoMessage | undefined> {
    const protoMessage = this.decoder.fromWireToProtoObj(bytes);
    log.info("Message decoded", protoMessage);
    return Promise.resolve(protoMessage);
  }

  public async fromProtoObj(
    pubsubTopic: string,
    proto: IProtoMessage
  ): Promise<RlnMessage<T> | undefined> {
    const msg: T | undefined = await this.decoder.fromProtoObj(
      pubsubTopic,
      proto
    );
    if (!msg) return;
    return new RlnMessage(this.rlnInstance, msg, proto.rateLimitProof);
  }
}

type RLNDecoderOptions<T extends IDecodedMessage> = {
  decoder: IDecoder<T>;
  rlnInstance: RLNInstance;
};

export const createRLNDecoder = <T extends IDecodedMessage>(
  options: RLNDecoderOptions<T>
): RLNDecoder<T> => {
  return new RLNDecoder(options.rlnInstance, options.decoder);
};
