"use client";

import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "@scaffold-ui/components";

const PONDER_URL =
  process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

const TRANSFERS_QUERY = gql`
  {
    transfers(orderBy: "blockNumber", orderDirection: "desc", limit: 20) {
      items {
        id
        tokenId
        from
        to
        blockNumber
        timestamp
        transactionHash
      }
    }
  }
`;

const HOLDERS_QUERY = gql`
  {
    holders(orderBy: "balance", orderDirection: "desc", limit: 50) {
      items {
        id
        balance
      }
    }
  }
`;

const NFTS_QUERY = gql`
  {
    nfts(orderBy: "id", orderDirection: "asc", limit: 50) {
      items {
        id
        owner
        uri
        mintedAt
        transferredAt
      }
    }
  }
`;

type TransfersData = {
  transfers: {
    items: {
      tokenId: string;
      from: string;
      to: string;
      blockNumber: number;
      timestamp: number;
      transactionHash: string;
    }[];
  };
};

type HoldersData = {
  holders: {
    items: { id: string; balance: string }[];
  };
};

type NftsData = {
  nfts: {
    items: { id: string; owner: string; uri: string | null }[];
  };
};

const fetchAll = async () => {
  const [transfers, holders, nfts] = await Promise.all([
    request<TransfersData>(`${PONDER_URL}/graphql`, TRANSFERS_QUERY),
    request<HoldersData>(`${PONDER_URL}/graphql`, HOLDERS_QUERY),
    request<NftsData>(`${PONDER_URL}/graphql`, NFTS_QUERY),
  ]);
  return { transfers: transfers.transfers.items, holders: holders.holders.items, nfts: nfts.nfts.items };
};

export const PonderNFTs = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ponder-indexer"],
    queryFn: fetchAll,
    refetchInterval: 10_000,
  });

  if (isLoading) return <span className="loading loading-spinner loading-lg" />;

  if (isError) {
    return (
      <div className="alert alert-error max-w-2xl">
        <span>
          Cannot reach the Ponder API at {PONDER_URL}/graphql. Start it with{" "}
          <code>yarn ponder:dev</code> after running{" "}
          <code>yarn chain</code> and <code>yarn deploy</code>.
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