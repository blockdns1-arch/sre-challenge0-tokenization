"use client";

import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "@scaffold-ui/components";

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "http://localhost:8000/subgraphs/name/blockdns1-arch/your-collectible";

const TRANSFERS_QUERY = gql`
  {
    nftTransfers(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      tokenId
      from
      to
      blockNumber
      timestamp
      txHash
    }
  }
`;

const HOLDERS_QUERY = gql`
  {
    holders(first: 50, orderBy: balance, orderDirection: desc) {
      id
      balance
    }
  }
`;

const NFTS_QUERY = gql`
  {
    nfts(first: 50, orderBy: mintedAt, orderDirection: asc) {
      id
      owner
      uri
      mintedAt
    }
  }
`;

type TransfersData = {
  nftTransfers: {
    tokenId: string;
    from: string;
    to: string;
    blockNumber: string;
    timestamp: string;
    txHash: string;
  }[];
};

type HoldersData = {
  holders: { id: string; balance: string }[];
};

type NftsData = {
  nfts: { id: string; owner: string; uri: string | null; mintedAt: string }[];
};

const fetchAll = async () => {
  const [transfers, holders, nfts] = await Promise.all([
    request<TransfersData>(SUBGRAPH_URL, TRANSFERS_QUERY),
    request<HoldersData>(SUBGRAPH_URL, HOLDERS_QUERY),
    request<NftsData>(SUBGRAPH_URL, NFTS_QUERY),
  ]);
  return { transfers: transfers.nftTransfers, holders: holders.holders, nfts: nfts.nfts };
};

export const SubgraphNFTs = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subgraph-indexer"],
    queryFn: fetchAll,
    refetchInterval: 10_000,
  });

  if (isLoading) return <span className="loading loading-spinner loading-lg" />;

  if (isError) {
    return (
      <div className="alert alert-error max-w-2xl">
        <span>
          Cannot reach the subgraph at {SUBGRAPH_URL}. Start the local Graph
          Node with <code>yarn subgraph:run-node</code> (Docker), then{" "}
          <code>yarn subgraph:local-ship</code>.
          {error instanceof Error ? ` (${error.message})` : ""}
        </span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col w-full max-w-5xl gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Holders</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Wallet</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holders.map(holder => (
                    <tr key={holder.id}>
                      <td>
                        <Address address={holder.id as `0x${string}`} />
                      </td>
                      <td className="text-right">{holder.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">NFTs</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Token ID</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {data.nfts.map(nft => (
                    <tr key={nft.id}>
                      <td>#{nft.id}</td>
                      <td>
                        <Address address={nft.owner as `0x${string}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Recent Transfers</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Block</th>
                </tr>
              </thead>
              <tbody>
                {data.transfers.map(transfer => (
                  <tr key={transfer.id}>
                    <td>#{transfer.tokenId}</td>
                    <td>
                      <Address address={transfer.from as `0x${string}`} />
                    </td>
                    <td>
                      <Address address={transfer.to as `0x${string}`} />
                    </td>
                    <td>{transfer.blockNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};