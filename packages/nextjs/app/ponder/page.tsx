import { PonderNFTs } from "./_components/PonderNFTs";

const PonderPage = () => {
  return (
    <div className="flex flex-col items-center py-8 gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">Ponder Indexer</h1>
        <p className="text-lg text-base-content/60">
          NFTs, holders and transfer history indexed from onchain events via Ponder (GraphQL API on :42069)
        </p>
      </div>
      <PonderNFTs />
    </div>
  );
};

export default PonderPage;