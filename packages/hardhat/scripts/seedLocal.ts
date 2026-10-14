import { JsonRpcProvider, Wallet, Contract } from "ethers";

const RPC = "http://127.0.0.1:8545";
const CONTRACT = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const acct0 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const acct1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const acct2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const acct3 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

const uris = ["ipfs://QmSeedZebra0", "ipfs://QmSeedBuffalo1", "ipfs://QmSeedRhino2", "ipfs://QmSeedTiger3", "ipfs://QmSeedGiraffe4", "ipfs://QmSeedElephant5"];

const abi = [
  "function mintItem(address to, string uri) returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

async function main() {
  const provider = new JsonRpcProvider(RPC);
  const wallet = new Wallet(PK, provider);
  const collectible = new Contract(CONTRACT, abi, wallet);

  async function nextNonce() {
    const raw = (await provider.send("eth_getTransactionCount", [wallet.address, "latest"])) as string;
    return BigInt(raw);
  }

  const supply = (await collectible.totalSupply()).toString();
  console.log("totalSupply:", supply);

  const ownersById: string[] = [acct0, acct1, acct2, acct0, acct0, acct3];

  console.log("== minting missing ==");
  let supplyNum = Number(supply);
  while (supplyNum < 6) {
    const to = ownersById[supplyNum];
    const uri = uris[supplyNum];
    const nonce = await nextNonce();
    const tx = await collectible.mintItem(to, uri, { nonce });
    await tx.wait();
    console.log("minted id", supplyNum, "to", to, "nonce", nonce.toString());
    supplyNum++;
  }

  console.log("== transferring ==");
  const PK1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const PK2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
  const PK3 = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
  const signerByOwner: Record<string, string> = {
    [acct0.toLowerCase()]: PK,
    [acct1.toLowerCase()]: PK1,
    [acct2.toLowerCase()]: PK2,
    [acct3.toLowerCase()]: PK3,
  };
  const transferPlans: { id: bigint; from: string; to: string }[] = [
    { id: 1n, from: acct0, to: acct1 },
    { id: 3n, from: acct2, to: acct0 },
    { id: 5n, from: acct0, to: acct1 },
    { id: 2n, from: acct1, to: acct0 },
    { id: 6n, from: acct3, to: acct0 },
  ];
  for (const { id, from, to } of transferPlans) {
    const owner = (await collectible.ownerOf(id)) as string;
    if (owner.toLowerCase() !== from.toLowerCase()) {
      console.log("skip (owner changed):", id.toString());
      continue;
    }
    const signerPk = signerByOwner[from.toLowerCase()];
    const signerWallet = new Wallet(signerPk, provider);
    const asSigner = new Contract(CONTRACT, abi, signerWallet);
    const nonce = await nextNonceTx(signerWallet.address);
    const tx = await asSigner.transferFrom(from, to, id, { nonce });
    await tx.wait();
    console.log("transferred", id.toString(), from.slice(0, 6), "->", to.slice(0, 6), "nonce", nonce.toString());
  }

  async function nextNonceTx(addr: string) {
    const raw = (await provider.send("eth_getTransactionCount", [addr, "latest"])) as string;
    return BigInt(raw);
  }

  console.log("== status ==");
  console.log("totalSupply:", (await collectible.totalSupply()).toString());
  for (const [name, addr] of [["acct0", acct0], ["acct1", acct1], ["acct2", acct2], ["acct3", acct3]] as const) {
    console.log(`balance ${name}:`, (await collectible.balanceOf(addr)).toString());
  }
  for (const id of [0n, 1n, 2n, 3n]) {
    console.log(`ownerOf ${id}:`, await collectible.ownerOf(id));
  }
}

main().catch(e => {
  console.error(e.shortMessage ?? e.message ?? e);
  process.exit(1);
});