import { assert, expect } from "chai";

import { createRLN } from "./create.js";

describe("js-rln", () => {
  it("should verify a proof", async function () {
    const rlnInstance = await createRLN();

    const credential = rlnInstance.zerokit.generateIdentityCredentials();

    //peer's index in the Merkle Tree
    const index = 5;

    // Create a Merkle tree with random members
    for (let i = 0; i < 10; i++) {
      if (i == index) {
        // insert the current peer's pk
        rlnInstance.zerokit.insertMember(credential.IDCommitment);
      } else {
        // create a new key pair
        rlnInstance.zerokit.insertMember(
          rlnInstance.zerokit.generateIdentityCredentials().IDCommitment
        );
      }
    }

    // prepare the message
    const uint8Msg = Uint8Array.from(
      "Hello World".split("").map((x) => x.charCodeAt(0))
    );

    // setting up the epoch
    const epoch = new Date();

    // generating proof
    const proof = await rlnInstance.zerokit.generateRLNProof(
      uint8Msg,
      index,
      epoch,
      credential.IDSecretHash
    );

    try {
      // verify the proof
      const verifResult = rlnInstance.zerokit.verifyRLNProof(proof, uint8Msg);
      expect(verifResult).to.be.true;
    } catch (err) {
      assert.fail(0, 1, "should not have failed proof verification");
    }

    try {
      // Modifying the signal so it's invalid
      uint8Msg[4] = 4;
      // verify the proof
      const verifResult = rlnInstance.zerokit.verifyRLNProof(proof, uint8Msg);
      expect(verifResult).to.be.false;
    } catch (err) {
      console.log(err);
    }
  });
  it("should verify a proof with a seeded membership key generation", async function () {
    const rlnInstance = await createRLN();
    const seed = "This is a test seed";
    const credential =
      rlnInstance.zerokit.generateSeededIdentityCredential(seed);

    //peer's index in the Merkle Tree
    const index = 5;

    // Create a Merkle tree with random members
    for (let i = 0; i < 10; i++) {
      if (i == index) {
        // insert the current peer's pk
        rlnInstance.zerokit.insertMember(credential.IDCommitment);
      } else {
        // create a new key pair
        rlnInstance.zerokit.insertMember(
          rlnInstance.zerokit.generateIdentityCredentials().IDCommitment
        );
      }
    }

    // prepare the message
    const uint8Msg = Uint8Array.from(
      "Hello World".split("").map((x) => x.charCodeAt(0))
    );

    // setting up the epoch
    const epoch = new Date();

    // generating proof
    const proof = await rlnInstance.zerokit.generateRLNProof(
      uint8Msg,
      index,
      epoch,
      credential.IDSecretHash
    );

    try {
      // verify the proof
      const verifResult = rlnInstance.zerokit.verifyRLNProof(proof, uint8Msg);
      expect(verifResult).to.be.true;
    } catch (err) {
      assert.fail(0, 1, "should not have failed proof verification");
    }

    try {
      // Modifying the signal so it's invalid
      uint8Msg[4] = 4;
      // verify the proof
      const verifResult = rlnInstance.zerokit.verifyRLNProof(proof, uint8Msg);
      expect(verifResult).to.be.false;
    } catch (err) {
      console.log(err);
    }
  });

  it("should generate the same membership key if the same seed is provided", async function () {
    const rlnInstance = await createRLN();
    const seed = "This is a test seed";
    const memKeys1 = rlnInstance.zerokit.generateSeededIdentityCredential(seed);
    const memKeys2 = rlnInstance.zerokit.generateSeededIdentityCredential(seed);

    memKeys1.IDCommitment.forEach((element, index) => {
      expect(element).to.equal(memKeys2.IDCommitment[index]);
    });
    memKeys1.IDNullifier.forEach((element, index) => {
      expect(element).to.equal(memKeys2.IDNullifier[index]);
    });
    memKeys1.IDSecretHash.forEach((element, index) => {
      expect(element).to.equal(memKeys2.IDSecretHash[index]);
    });
    memKeys1.IDTrapdoor.forEach((element, index) => {
      expect(element).to.equal(memKeys2.IDTrapdoor[index]);
    });
  });
});
