import { createConfig } from "ponder";
import deployedContracts from "../nextjs/contracts/deployedContracts";
import scaffoldConfig from "../nextjs/scaffold.config";

const targetNetwork = scaffoldConfig.targetNetworks[0];

const deployedContractsForNetwork = deployedContracts[targetNetwork.id];
if (!deployedContractsForNetwork) {
  throw new Error(`No deployed contracts found for network ID ${targetNetwork.id}`);
}

const yourCollectible = deployedContractsForNetwork.YourCollectible;

const startBlock = "deployedOnBlock" in yourCollectible ? yourCollectible.deployedOnBlock : 0;

export default createConfig({
  chains: {
    [targetNetwork.name]: {
      id: targetNetwork.id,
      rpc:
        process.env[`PONDER_RPC_URL_${targetNetwork.id}`] || "http://127.0.0.1:8545",
    },
  },
  contracts: {
    YourCollectible: {
      abi: yourCollectible.abi,
      chain: targetNetwork.name as string,
      address: yourCollectible.address,
      startBlock,
    },
  },
});