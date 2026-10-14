import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../generated/YourCollectible/YourCollectible";
import { Holder, Nft, NftTransfer } from "../generated/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: TransferEvent): void {
  const fromString = event.params.from.toHexString();
  const toString = event.params.to.toHexString();

  if (fromString != ZERO_ADDRESS) {
    let holder = Holder.load(fromString);
    if (holder == null) {
      holder = new Holder(fromString);
      holder.balance = BigInt.zero();
    }
    holder.balance = holder.balance.minus(BigInt.fromI32(1));
    holder.save();
  }

  if (toString != ZERO_ADDRESS) {
    let holder = Holder.load(toString);
    if (holder == null) {
      holder = new Holder(toString);
      holder.balance = BigInt.zero();
    }
    holder.balance = holder.balance.plus(BigInt.fromI32(1));
    holder.save();
  }

  const tokenIdString = event.params.tokenId.toString();
  let nft = Nft.load(tokenIdString);
  if (nft == null) {
    nft = new Nft(tokenIdString);
    nft.uri = null;
    nft.mintedAt = BigInt.fromI32(0);
  }
  nft.owner = event.params.to;
  nft.transferredAt = event.block.timestamp;
  if (fromString == ZERO_ADDRESS) {
    nft.mintedAt = event.block.timestamp;
  }
  nft.save();

  const transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const nftTransfer = new NftTransfer(transferId);
  nftTransfer.tokenId = event.params.tokenId;
  nftTransfer.from = event.params.from;
  nftTransfer.to = event.params.to;
  nftTransfer.blockNumber = event.block.number;
  nftTransfer.timestamp = event.block.timestamp;
  nftTransfer.txHash = event.transaction.hash;
  nftTransfer.save();
}