import { ethers } from "ethers";

export const extractMetaMaskSigner = async (): Promise<ethers.Signer> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    throw Error(
      "Missing or invalid Ethereum provider. Please install a Web3 wallet such as MetaMask."
    );
  }

  await ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(ethereum, "any");

  return provider.getSigner();
};
