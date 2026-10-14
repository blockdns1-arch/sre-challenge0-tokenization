import "dotenv/config";
import { Interface, JsonRpcProvider, Wallet } from "ethers";
import password from "@inquirer/password";

const CONTRACT = "0x04b7ffc9e392e612106198087ef216e56d39d81a";
const RPC = process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";
const RECIPIENT = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const NFT_METADATA_BASE = "ipfs://QmY7Yh4UquoXHLPFo2RbhZWdavVte9t5De7zB5FcxYShjL/NFTMetadata/";

const MINT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function mintItem(address to, string uri) returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
];

async function main() {
  const encrypted = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  if (!encrypted) {
    console.log("No deployer account. Run `yarn account:import` first.");
    return;
  }
  const pass = await password({ message: "Enter password to decrypt private key:" });

  let wallet: Wallet;
  try {
    wallet = await Wallet.fromEncryptedJson(encrypted, pass);
  } catch {
    console.error("Failed to decrypt private key. Wrong password?");
    process.exit(1);
  }

  const provider = new JsonRpcProvider(RPC);
  const signer = wallet.connect(provider);
  const iface = new Interface(MINT_ABI);
  const account = (await signer.getAddress()).toLowerCase();

  console.log(`Minting on Sepolia as deployer ${account}\n`);

  const minted: bigint[] = [];
  for (let i = 0; i < 6; i++) {
    const data = iface.encodeFunctionData("mintItem", [
      account,
      `${NFT_METADATA_BASE}${i}`,
    ]);
    const tx = await signer.sendTransaction({ to: CONTRACT, data });
    const rc = await tx.wait();
    const fromLog = rc?.logs.find(l => {
      try {
        return iface.parseLog(l)?.name === "Transfer";
      } catch {
        return false;
      }
    });
    const tokenId = fromLog ? fromLog.topics[3] : "?";
    minted.push(BigInt(tokenId));
    console.log(`  minted token #${tokenId}  tx=${tx.hash}  status=${rc?.status}`);
  }

  for (let i = 0; i < 2; i++) {
    const tokenId = minted[i];
    const data = iface.encodeFunctionData("transferFrom", [account, RECIPIENT, tokenId]);
    const tx = await signer.sendTransaction({ to: CONTRACT, data });
    const rc = await tx.wait();
    console.log(`  transferred token #${tokenId} -> ${RECIPIENT}  tx=${tx.hash}  status=${rc?.status}`);
  }

  const balance = await signer.call({ to: CONTRACT, data: iface.encodeFunctionData("balanceOf", [account]) });
  console.log(`\nDeployer NFT balance now: ${parseInt(balance, 16)}`);
}

main().catch(console.error);