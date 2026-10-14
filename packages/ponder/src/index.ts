import { ponder } from "ponder:registry";
import { zeroAddress } from "viem";
import { holder, nft, transfer } from "ponder:schema";

ponder.on("YourCollectible:Transfer", async ({ event, context }) => {
  const { db, contracts, client } = context;
  const { from, to, tokenId } = event.args;
  const timestamp = Number(event.block.timestamp);

  if (from !== zeroAddress) {
    await db
      .insert(holder)
      .values({ id: from, balance: -1n })
      .onConflictDoUpdate((row) => ({ balance: row.balance - 1n }));
  }

  if (to !== zeroAddress) {
    await db
      .insert(holder)
      .values({ id: to, balance: 1n })
      .onConflictDoUpdate((row) => ({ balance: row.balance + 1n }));
  }

  if (from === zeroAddress) {
    let uri: string | undefined;
    try {
      uri = await client.readContract({
        abi: contracts.YourCollectible.abi,
        address: contracts.YourCollectible.address,
        functionName: "tokenURI",
        args: [tokenId],
      });
    } catch {
      uri = undefined;
    }
    await db
      .insert(nft)
      .values({ id: tokenId, owner: to, uri, mintedAt: timestamp, transferredAt: timestamp })
      .onConflictDoUpdate({ owner: to, transferredAt: timestamp });
  } else {
    await db
      .insert(nft)
      .values({ id: tokenId, owner: to, mintedAt: 0, transferredAt: timestamp })
      .onConflictDoUpdate({ owner: to, transferredAt: timestamp });
  }

  await db.insert(transfer).values({
    id: event.id,
    tokenId,
    from,
    to,
    blockNumber: Number(event.block.number),
    timestamp,
    transactionHash: event.transaction.hash,
  });
});