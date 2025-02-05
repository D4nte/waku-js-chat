import { assert, expect } from "chai";

import { MerkleRootTracker } from "./root_tracker.js";

describe("js-rln", () => {
  it("should track merkle roots and backfill from block number", async function () {
    const acceptableRootWindow = 3;

    const tracker = new MerkleRootTracker(
      acceptableRootWindow,
      new Uint8Array([0, 0, 0, 0])
    );
    expect(tracker.roots()).to.have.length(1);
    expect(tracker.buffer()).to.have.length(0);
    expect(tracker.roots()[0]).to.deep.equal(new Uint8Array([0, 0, 0, 0]));

    for (let i = 1; i <= 30; i++) {
      tracker.pushRoot(i, new Uint8Array([0, 0, 0, i]));
    }

    expect(tracker.roots()).to.have.length(acceptableRootWindow);
    expect(tracker.buffer()).to.have.length(20);
    assert.sameDeepMembers(tracker.roots(), [
      new Uint8Array([0, 0, 0, 30]),
      new Uint8Array([0, 0, 0, 29]),
      new Uint8Array([0, 0, 0, 28])
    ]);

    // Buffer should keep track of 20 blocks previous to the current valid merkle root window
    expect(tracker.buffer()[0]).to.be.eql(new Uint8Array([0, 0, 0, 8]));
    expect(tracker.buffer()[19]).to.be.eql(new Uint8Array([0, 0, 0, 27]));

    // Remove roots 29 and 30
    tracker.backFill(29);
    assert.sameDeepMembers(tracker.roots(), [
      new Uint8Array([0, 0, 0, 28]),
      new Uint8Array([0, 0, 0, 27]),
      new Uint8Array([0, 0, 0, 26])
    ]);

    expect(tracker.buffer()).to.have.length(18);
    expect(tracker.buffer()[0]).to.be.eql(new Uint8Array([0, 0, 0, 8]));
    expect(tracker.buffer()[17]).to.be.eql(new Uint8Array([0, 0, 0, 25]));

    // Remove roots from block 15 onwards. These blocks exists within the buffer
    tracker.backFill(15);
    assert.sameDeepMembers(tracker.roots(), [
      new Uint8Array([0, 0, 0, 14]),
      new Uint8Array([0, 0, 0, 13]),
      new Uint8Array([0, 0, 0, 12])
    ]);
    expect(tracker.buffer()).to.have.length(4);
    expect(tracker.buffer()[0]).to.be.eql(new Uint8Array([0, 0, 0, 8]));
    expect(tracker.buffer()[3]).to.be.eql(new Uint8Array([0, 0, 0, 11]));
  });
});
