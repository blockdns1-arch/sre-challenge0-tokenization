import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index";
import { clearStore, test, assert, logStore } from "matchstick-as/assembly/index";
import { handleTransfer } from "../src/mapping";
import { Transfer } from "../generated/YourCollectible/YourCollectible";

const ZERO = "0x0000000000000000000000000000000000000000";
const ALICE = "0x00000000000000000000000000000000000000A1";
const BOB = "0x00000000000000000000000000000000000000B2";

function createTransferEvent(from: string, to: string, tokenId: string): ethereum.Event {
  const transferEvent = changetype<ethereum.Event>(newMockEvent());
  transferEvent.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(BigInt.fromString(tokenId))),
  ];
  transferEvent.transaction.hash = ethereum.Hash.fromByteArray(
    Bytes.fromHexString("0x1111111111111111111111111111111111111111111111111111111111111111"),
  );
  transferEvent.logIndex = BigInt.fromI32(0);
  transferEvent.block.number = BigInt.fromI32(1);
  transferEvent.block.timestamp = BigInt.fromI32(1700000000);
  return transferEvent;
}

test("mint(): creates NFT, holder and transfer record", () => {
  clearStore();

  const event = createTransferEvent(ZERO, ALICE, "1");
  handleTransfer(changetype<Transfer>(event));

  assert.fieldEquals("Nft", "1", "owner", ALICE);
  assert.fieldEquals("Nft", "1", "mintedAt", "1700000000");
  assert.fieldEquals("Holder", ALICE.toLowerCase(), "balance", "1");
  logStore();
});

test("transfer(): moves NFT and updates holder balances", () => {
  clearStore();

  handleTransfer(changetype<Transfer>(createTransferEvent(ZERO, ALICE, "1")));
  handleTransfer(changetype<Transfer>(createTransferEvent(ZERO, BOB, "2")));
  handleTransfer(changetype<Transfer>(createTransferEvent(ALICE, BOB, "1")));

  assert.fieldEquals("Nft", "1", "owner", BOB);
  assert.fieldEquals("Nft", "2", "owner", BOB);
  assert.fieldEquals("Holder", ALICE.toLowerCase(), "balance", "0");
  assert.fieldEquals("Holder", BOB.toLowerCase(), "balance", "2");
  logStore();
});