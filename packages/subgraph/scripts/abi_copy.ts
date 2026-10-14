import * as fs from "fs";
import type { Abi } from "viem";

const DEPLOYED_CONTRACTS_FILE = "../nextjs/contracts/deployedContracts.ts";
const GRAPH_DIR = "./";

function publishContract(
  contractName: string,
  contractObject: { address: string; abi: Abi },
  networkName: string,
) {
  const graphConfigPath = `${GRAPH_DIR}/networks.json`;
  let graphConfig = fs.existsSync(graphConfigPath)
    ? JSON.parse(fs.readFileSync(graphConfigPath, "utf8"))
    : {};

  if (!graphConfig[networkName]) graphConfig[networkName] = {};
  graphConfig[networkName][contractName] = { address: contractObject.address };

  fs.writeFileSync(graphConfigPath, JSON.stringify(graphConfig, null, 2));
  if (!fs.existsSync(`${GRAPH_DIR}/abis`)) fs.mkdirSync(`${GRAPH_DIR}/abis`);
  fs.writeFileSync(
    `${GRAPH_DIR}/abis/${networkName}_${contractName}.json`,
    JSON.stringify(contractObject.abi, null, 2),
  );
}

async function main() {
  const fileContent = fs.readFileSync(DEPLOYED_CONTRACTS_FILE, "utf8");
  const match = fileContent.match(
    /const deployedContracts = ({[^;]+}) as const;/s,
  );
  if (!match?.[1]) throw new Error("Failed to find deployedContracts");

  let json = match[1]
    .replace(/(\w+)(?=\s*:)/g, '"$1"')
    .replace(/,(?=\s*[}\]])/g, "");
  const contracts = JSON.parse(json);
  const networkIdArg = process.argv[2];
  const networkId = Number(networkIdArg || "31337");

  const networkNames: Record<number, string> = {
    31337: "localhost",
    11155111: "sepolia",
  };
  const networkName = networkNames[networkId] ?? String(networkId);

  const networkContracts = contracts[networkId];

  if (!networkContracts) {
    console.error(`No contracts for network ${networkId}.`);
    return;
  }

  for (const name in networkContracts) {
    publishContract(name, networkContracts[name], networkName);
  }
  console.log(`Published contracts for ${networkName} to subgraph package.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});