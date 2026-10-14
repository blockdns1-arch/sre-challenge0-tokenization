import { onchainTable } from "ponder";

export const transfer = onchainTable("transfer", (t) => ({
  id: t.text().primaryKey(),
  tokenId: t.bigint().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  blockNumber: t.integer().notNull(),
  timestamp: t.integer().notNull(),
  transactionHash: t.hex().notNull(),
}));

export const nft = onchainTable("nft", (t) => ({
  id: t.bigint().primaryKey(),
  owner: t.hex().notNull(),
  uri: t.text(),
  mintedAt: t.integer().notNull(),
  transferredAt: t.integer(),
}));

export const holder = onchainTable("holder", (t) => ({
  id: t.hex().primaryKey(),
  balance: t.bigint().notNull(),
}));