import * as chai from "chai";
import spies from "chai-spies";
import * as ethers from "ethers";

import { createRLN } from "../create.js";

import { SEPOLIA_CONTRACT } from "./constants.js";
import { RLNContract } from "./rln_contract.js";

chai.use(spies);

//TOOD: enable this test
describe.skip("RLN Contract abstraction", () => {
  it("should be able to fetch members from events and store to rln instance", async () => {
    const rlnInstance = await createRLN();

    rlnInstance.zerokit.insertMember = () => undefined;
    const insertMemberSpy = chai.spy.on(rlnInstance.zerokit, "insertMember");

    const voidSigner = new ethers.VoidSigner(SEPOLIA_CONTRACT.address);
    const rlnContract = new RLNContract(rlnInstance, {
      registryAddress: SEPOLIA_CONTRACT.address,
      signer: voidSigner
    });

    rlnContract["storageContract"] = {
      queryFilter: () => Promise.resolve([mockEvent()])
    } as unknown as ethers.Contract;
    rlnContract["_membersFilter"] = {
      address: "",
      topics: []
    } as unknown as ethers.EventFilter;

    await rlnContract.fetchMembers(rlnInstance);

    chai.expect(insertMemberSpy).to.have.been.called();
  });

  it("should register a member", async () => {
    const mockSignature =
      "0xdeb8a6b00a8e404deb1f52d3aa72ed7f60a2ff4484c737eedaef18a0aacb2dfb4d5d74ac39bb71fa358cf2eb390565a35b026cc6272f2010d4351e17670311c21c";

    const rlnInstance = await createRLN();
    const voidSigner = new ethers.VoidSigner(SEPOLIA_CONTRACT.address);
    const rlnContract = new RLNContract(rlnInstance, {
      registryAddress: SEPOLIA_CONTRACT.address,
      signer: voidSigner
    });

    rlnContract["storageIndex"] = 1;
    rlnContract["_membersFilter"] = {
      address: "",
      topics: []
    } as unknown as ethers.EventFilter;
    rlnContract["registryContract"] = {
      "register(uint16,uint256)": () =>
        Promise.resolve({ wait: () => Promise.resolve(undefined) })
    } as unknown as ethers.Contract;
    const contractSpy = chai.spy.on(
      rlnContract["registryContract"],
      "register(uint16,uint256)"
    );

    const identity =
      rlnInstance.zerokit.generateSeededIdentityCredential(mockSignature);
    await rlnContract.registerWithIdentity(identity);

    chai.expect(contractSpy).to.have.been.called();
  });
});

function mockEvent(): ethers.Event {
  return {
    args: {
      idCommitment: { _hex: "0xb3df1c4e5600ef2b" },
      index: ethers.BigNumber.from(1)
    }
  } as unknown as ethers.Event;
}
