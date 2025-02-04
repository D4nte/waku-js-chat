// ref https://github.com/waku-org/waku-rln-contract/blob/19fded82bca07e7b535b429dc507cfb83f10dfcf/deployments/sepolia/WakuRlnRegistry_Implementation.json#L3
export const RLN_REGISTRY_ABI = [
  "error IncompatibleStorage()",
  "error IncompatibleStorageIndex()",
  "error NoStorageContractAvailable()",
  "error StorageAlreadyExists(address storageAddress)",
  "event AdminChanged(address previousAdmin, address newAdmin)",
  "event BeaconUpgraded(address indexed beacon)",
  "event Initialized(uint8 version)",
  "event NewStorageContract(uint16 index, address storageAddress)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Upgraded(address indexed implementation)",
  "function forceProgress()",
  "function initialize(address _poseidonHasher)",
  "function newStorage()",
  "function nextStorageIndex() view returns (uint16)",
  "function owner() view returns (address)",
  "function poseidonHasher() view returns (address)",
  "function proxiableUUID() view returns (bytes32)",
  "function register(uint16 storageIndex, uint256 commitment)",
  "function register(uint256[] commitments)",
  "function register(uint16 storageIndex, uint256[] commitments)",
  "function registerStorage(address storageAddress)",
  "function renounceOwnership()",
  "function storages(uint16) view returns (address)",
  "function transferOwnership(address newOwner)",
  "function upgradeTo(address newImplementation)",
  "function upgradeToAndCall(address newImplementation, bytes data) payable",
  "function usingStorageIndex() view returns (uint16)"
];

// ref https://github.com/waku-org/waku-rln-contract/blob/19fded82bca07e7b535b429dc507cfb83f10dfcf/deployments/sepolia/WakuRlnStorage_0.json#L3
export const RLN_STORAGE_ABI = [
  "constructor(address _poseidonHasher, uint16 _contractIndex)",
  "error DuplicateIdCommitment()",
  "error FullTree()",
  "error InvalidIdCommitment(uint256 idCommitment)",
  "error NotImplemented()",
  "event MemberRegistered(uint256 idCommitment, uint256 index)",
  "event MemberWithdrawn(uint256 idCommitment, uint256 index)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "function DEPTH() view returns (uint256)",
  "function MEMBERSHIP_DEPOSIT() view returns (uint256)",
  "function SET_SIZE() view returns (uint256)",
  "function contractIndex() view returns (uint16)",
  "function deployedBlockNumber() view returns (uint32)",
  "function idCommitmentIndex() view returns (uint256)",
  "function isValidCommitment(uint256 idCommitment) view returns (bool)",
  "function memberExists(uint256) view returns (bool)",
  "function members(uint256) view returns (uint256)",
  "function owner() view returns (address)",
  "function poseidonHasher() view returns (address)",
  "function register(uint256[] idCommitments)",
  "function register(uint256 idCommitment) payable",
  "function renounceOwnership()",
  "function slash(uint256 idCommitment, address receiver, uint256[8] proof) pure",
  "function stakedAmounts(uint256) view returns (uint256)",
  "function transferOwnership(address newOwner)",
  "function verifier() view returns (address)",
  "function withdraw() pure",
  "function withdrawalBalance(address) view returns (uint256)"
];

export const SEPOLIA_CONTRACT = {
  chainId: 11155111,
  address: "0xF471d71E9b1455bBF4b85d475afb9BB0954A29c4",
  abi: RLN_REGISTRY_ABI
};
