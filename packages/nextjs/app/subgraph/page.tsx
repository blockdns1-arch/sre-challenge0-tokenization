import { SubgraphNFTs } from "./_components/SubgraphNFTs";

const SubgraphPage = () => {
  return (
    <div className="flex flex-col items-center py-8 gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">The Graph Subgraph</h1>
        <p className="text-lg text-base-content/60">
          NFTs, holders and transfer history indexed from onchain events with a subgraph
        </p>
      </div>
      <SubgraphNFTs />
    </div>
  );
};

export default SubgraphPage;