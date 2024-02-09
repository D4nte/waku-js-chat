import type { PeerInfo } from "@libp2p/interface";
import { CustomEvent } from "@libp2p/interface";
import { createSecp256k1PeerId } from "@libp2p/peer-id-factory";
import { LightNode, Tags } from "@waku/interfaces";
import { createLightNode } from "@waku/sdk";
import { expect } from "chai";
import sinon, { SinonSpy, SinonStub } from "sinon";

import { delay } from "../../src/index.js";
import { tearDownNodes } from "../../src/index.js";

const DELAY_MS = 1_000;

describe("Dials", function () {
  this.timeout(10_000);
  let dialPeerStub: SinonStub;
  let getConnectionsStub: SinonStub;
  let getTagNamesForPeerStub: SinonStub;
  let isPeerTopicConfigured: SinonStub;
  let waku: LightNode;

  this.beforeEach(async function () {
    waku = await createLightNode({ shardInfo: { shards: [0] } });
    isPeerTopicConfigured = sinon.stub(
      waku.connectionManager as any,
      "isPeerTopicConfigured"
    );
    isPeerTopicConfigured.resolves(true);
  });

  afterEach(async () => {
    await tearDownNodes([], waku);
    isPeerTopicConfigured.restore();
    sinon.restore();
  });

  describe("attemptDial method", function () {
    let attemptDialSpy: SinonSpy;

    beforeEach(function () {
      attemptDialSpy = sinon.spy(waku.connectionManager as any, "attemptDial");
    });

    afterEach(function () {
      attemptDialSpy.restore();
    });

    it("should be called at least once on all `peer:discovery` events", async function () {
      const totalPeerIds = 5;
      for (let i = 1; i <= totalPeerIds; i++) {
        waku.libp2p.dispatchEvent(
          new CustomEvent<PeerInfo>("peer:discovery", {
            detail: {
              id: await createSecp256k1PeerId(),
              multiaddrs: []
            }
          })
        );
      }

      await delay(100);

      expect(attemptDialSpy.callCount).to.be.greaterThanOrEqual(
        totalPeerIds,
        "attemptDial should be called at least once for each peer:discovery event"
      );
    });
  });

  describe("dialPeer method", function () {
    let peerStoreHasStub: SinonStub;
    let dialAttemptsForPeerHasStub: SinonStub;
    beforeEach(function () {
      getConnectionsStub = sinon.stub(
        (waku.connectionManager as any).libp2p,
        "getConnections"
      );
      getTagNamesForPeerStub = sinon.stub(
        waku.connectionManager as any,
        "getTagNamesForPeer"
      );
      dialPeerStub = sinon.stub(waku.connectionManager as any, "dialPeer");
      peerStoreHasStub = sinon.stub(waku.libp2p.peerStore, "has");
      dialAttemptsForPeerHasStub = sinon.stub(
        (waku.connectionManager as any).dialAttemptsForPeer,
        "has"
      );

      // simulate that the peer is not connected
      getConnectionsStub.returns([]);

      // simulate that the peer is a bootstrap peer
      getTagNamesForPeerStub.resolves([Tags.BOOTSTRAP]);

      // simulate that the peer is not in the peerStore
      peerStoreHasStub.returns(false);

      // simulate that the peer has not been dialed before
      dialAttemptsForPeerHasStub.returns(false);
    });

    afterEach(function () {
      dialPeerStub.restore();
      getTagNamesForPeerStub.restore();
      getConnectionsStub.restore();
      peerStoreHasStub.restore();
      dialAttemptsForPeerHasStub.restore();
    });

    describe("For bootstrap peers", function () {
      it("should be called for bootstrap peers", async function () {
        const bootstrapPeer = await createSecp256k1PeerId();

        // emit a peer:discovery event
        waku.libp2p.dispatchEvent(
          new CustomEvent<PeerInfo>("peer:discovery", {
            detail: { id: bootstrapPeer, multiaddrs: [] }
          })
        );

        // wait for the async function calls within attemptDial to finish
        await delay(DELAY_MS);

        // check that dialPeer was called once
        expect(dialPeerStub.callCount).to.equal(
          1,
          "dialPeer should be called for bootstrap peers"
        );
      });

      it("should not be called more than DEFAULT_MAX_BOOTSTRAP_PEERS_ALLOWED times for bootstrap peers", async function () {
        // emit first peer:discovery event
        waku.libp2p.dispatchEvent(
          new CustomEvent<PeerInfo>("peer:discovery", {
            detail: {
              id: await createSecp256k1PeerId(),
              multiaddrs: []
            }
          })
        );
        await delay(500);

        // simulate that the peer is connected
        getConnectionsStub.returns([{ tags: [{ name: Tags.BOOTSTRAP }] }]);

        // emit multiple peer:discovery events
        const totalBootstrapPeers = 5;
        for (let i = 1; i <= totalBootstrapPeers; i++) {
          await delay(500);
          waku.libp2p.dispatchEvent(
            new CustomEvent<PeerInfo>("peer:discovery", {
              detail: {
                id: await createSecp256k1PeerId(),
                multiaddrs: []
              }
            })
          );
        }

        // check that dialPeer was called only once
        expect(dialPeerStub.callCount).to.equal(
          1,
          "dialPeer should not be called more than once for bootstrap peers"
        );
      });
    });

    describe("For peer-exchange peers", function () {
      it("should be called for peers with PEER_EXCHANGE tags", async function () {
        const pxPeer = await createSecp256k1PeerId();

        // emit a peer:discovery event
        waku.libp2p.dispatchEvent(
          new CustomEvent<PeerInfo>("peer:discovery", {
            detail: {
              id: pxPeer,
              multiaddrs: []
            }
          })
        );

        // wait for the async function calls within attemptDial to finish
        await delay(DELAY_MS);

        // check that dialPeer was called once
        expect(dialPeerStub.callCount).to.equal(
          1,
          "dialPeer should be called for peers with PEER_EXCHANGE tags"
        );
      });

      it("should be called for every peer with PEER_EXCHANGE tags", async function () {
        // emit multiple peer:discovery events
        const totalPxPeers = 5;
        for (let i = 0; i < totalPxPeers; i++) {
          waku.libp2p.dispatchEvent(
            new CustomEvent<PeerInfo>("peer:discovery", {
              detail: {
                id: await createSecp256k1PeerId(),
                multiaddrs: []
              }
            })
          );
          await delay(500);
        }

        // check that dialPeer was called for each peer with PEER_EXCHANGE tags
        expect(dialPeerStub.callCount).to.equal(totalPxPeers);
      });
    });
  });
});
