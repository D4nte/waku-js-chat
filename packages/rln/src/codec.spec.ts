import {
  createDecoder,
  createEncoder,
  DecodedMessage
} from "@waku/core/lib/message/version_0";
import type { IProtoMessage } from "@waku/interfaces";
import {
  generatePrivateKey,
  generateSymmetricKey,
  getPublicKey
} from "@waku/message-encryption";
import {
  createDecoder as createAsymDecoder,
  createEncoder as createAsymEncoder
} from "@waku/message-encryption/ecies";
import {
  createDecoder as createSymDecoder,
  createEncoder as createSymEncoder
} from "@waku/message-encryption/symmetric";
import { expect } from "chai";

import {
  createRLNDecoder,
  createRLNEncoder,
  RLNDecoder,
  RLNEncoder
} from "./codec.js";
import { createRLN } from "./create.js";
import { RlnMessage } from "./message.js";
import { epochBytesToInt } from "./utils/index.js";

const TestContentTopic = "/test/1/waku-message/utf8";
const EMPTY_PUBSUB_TOPIC = "";

const EMPTY_PROTO_MESSAGE = {
  timestamp: undefined,
  contentTopic: "",
  ephemeral: undefined,
  meta: undefined,
  rateLimitProof: undefined,
  version: undefined
};

describe("RLN codec with version 0", () => {
  it("toWire", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const rlnEncoder = createRLNEncoder({
      encoder: createEncoder({ contentTopic: TestContentTopic }),
      rlnInstance,
      index,
      credential
    });
    const rlnDecoder = createRLNDecoder({
      rlnInstance,
      decoder: createDecoder(TestContentTopic)
    });

    const bytes = await rlnEncoder.toWire({ payload });

    expect(bytes).to.not.be.undefined;
    const protoResult = await rlnDecoder.fromWireToProtoObj(bytes!);
    expect(protoResult).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      protoResult!
    ))!;

    expect(msg.rateLimitProof).to.not.be.undefined;
    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(0);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });

  it("toProtoObj", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const rlnEncoder = new RLNEncoder(
      createEncoder({ contentTopic: TestContentTopic }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createDecoder(TestContentTopic)
    );

    const proto = await rlnEncoder.toProtoObj({ payload });

    expect(proto).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      proto!
    )) as RlnMessage<DecodedMessage>;

    expect(msg).to.not.be.undefined;
    expect(msg.rateLimitProof).to.not.be.undefined;

    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(0);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });
});

describe("RLN codec with version 1", () => {
  it("Symmetric, toWire", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const symKey = generateSymmetricKey();

    const rlnEncoder = new RLNEncoder(
      createSymEncoder({
        contentTopic: TestContentTopic,
        symKey
      }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createSymDecoder(TestContentTopic, symKey)
    );

    const bytes = await rlnEncoder.toWire({ payload });

    expect(bytes).to.not.be.undefined;
    const protoResult = await rlnDecoder.fromWireToProtoObj(bytes!);

    expect(protoResult).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      protoResult!
    ))!;

    expect(msg.rateLimitProof).to.not.be.undefined;
    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(1);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });

  it("Symmetric, toProtoObj", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const symKey = generateSymmetricKey();

    const rlnEncoder = new RLNEncoder(
      createSymEncoder({
        contentTopic: TestContentTopic,
        symKey
      }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createSymDecoder(TestContentTopic, symKey)
    );

    const proto = await rlnEncoder.toProtoObj({ payload });

    expect(proto).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      proto!
    )) as RlnMessage<DecodedMessage>;

    expect(msg).to.not.be.undefined;
    expect(msg.rateLimitProof).to.not.be.undefined;

    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(1);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });

  it("Asymmetric, toWire", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);

    const rlnEncoder = new RLNEncoder(
      createAsymEncoder({
        contentTopic: TestContentTopic,
        publicKey
      }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createAsymDecoder(TestContentTopic, privateKey)
    );

    const bytes = await rlnEncoder.toWire({ payload });

    expect(bytes).to.not.be.undefined;
    const protoResult = await rlnDecoder.fromWireToProtoObj(bytes!);

    expect(protoResult).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      protoResult!
    ))!;

    expect(msg.rateLimitProof).to.not.be.undefined;
    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(1);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });

  it("Asymmetric, toProtoObj", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);

    const rlnEncoder = new RLNEncoder(
      createAsymEncoder({
        contentTopic: TestContentTopic,
        publicKey
      }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createAsymDecoder(TestContentTopic, privateKey)
    );

    const proto = await rlnEncoder.toProtoObj({ payload });

    expect(proto).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      proto!
    )) as RlnMessage<DecodedMessage>;

    expect(msg).to.not.be.undefined;
    expect(msg.rateLimitProof).to.not.be.undefined;

    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(1);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });
});

describe("RLN Codec - epoch", () => {
  it("toProtoObj", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const rlnEncoder = new RLNEncoder(
      createEncoder({ contentTopic: TestContentTopic }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createDecoder(TestContentTopic)
    );

    const proto = await rlnEncoder.toProtoObj({ payload });

    expect(proto).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      proto!
    )) as RlnMessage<DecodedMessage>;

    const epochBytes = proto!.rateLimitProof!.epoch;
    const epoch = epochBytesToInt(epochBytes);

    expect(msg).to.not.be.undefined;
    expect(msg.rateLimitProof).to.not.be.undefined;

    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch!.toString(10).length).to.eq(9);
    expect(msg.epoch).to.eq(epoch);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(0);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });
});

describe("RLN codec with version 0 and meta setter", () => {
  // Encode the length of the payload
  // Not a relevant real life example
  const metaSetter = (msg: IProtoMessage & { meta: undefined }): Uint8Array => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, msg.payload.length, false);
    return new Uint8Array(buffer);
  };

  it("toWire", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const rlnEncoder = createRLNEncoder({
      encoder: createEncoder({ contentTopic: TestContentTopic, metaSetter }),
      rlnInstance,
      index,
      credential
    });
    const rlnDecoder = createRLNDecoder({
      rlnInstance,
      decoder: createDecoder(TestContentTopic)
    });

    const bytes = await rlnEncoder.toWire({ payload });

    expect(bytes).to.not.be.undefined;
    const protoResult = await rlnDecoder.fromWireToProtoObj(bytes!);
    expect(protoResult).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      protoResult!
    ))!;

    const expectedMeta = metaSetter({
      ...EMPTY_PROTO_MESSAGE,
      payload: protoResult!.payload
    });

    expect(msg!.meta).to.deep.eq(expectedMeta);

    expect(msg.rateLimitProof).to.not.be.undefined;
    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(0);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });

  it("toProtoObj", async function () {
    const rlnInstance = await createRLN();
    const credential = rlnInstance.zerokit.generateIdentityCredentials();
    const index = 0;
    const payload = new Uint8Array([1, 2, 3, 4, 5]);

    rlnInstance.zerokit.insertMember(credential.IDCommitment);

    const rlnEncoder = new RLNEncoder(
      createEncoder({ contentTopic: TestContentTopic, metaSetter }),
      rlnInstance,
      index,
      credential
    );
    const rlnDecoder = new RLNDecoder(
      rlnInstance,
      createDecoder(TestContentTopic)
    );

    const proto = await rlnEncoder.toProtoObj({ payload });

    expect(proto).to.not.be.undefined;
    const msg = (await rlnDecoder.fromProtoObj(
      EMPTY_PUBSUB_TOPIC,
      proto!
    )) as RlnMessage<DecodedMessage>;

    const expectedMeta = metaSetter({
      ...EMPTY_PROTO_MESSAGE,
      payload: msg!.payload
    });

    expect(msg!.meta).to.deep.eq(expectedMeta);

    expect(msg).to.not.be.undefined;
    expect(msg.rateLimitProof).to.not.be.undefined;

    expect(msg.verify([rlnInstance.zerokit.getMerkleRoot()])).to.be.true;
    expect(msg.verifyNoRoot()).to.be.true;
    expect(msg.epoch).to.not.be.undefined;
    expect(msg.epoch).to.be.gt(0);

    expect(msg.contentTopic).to.eq(TestContentTopic);
    expect(msg.msg.version).to.eq(0);
    expect(msg.payload).to.deep.eq(payload);
    expect(msg.timestamp).to.not.be.undefined;
  });
});
