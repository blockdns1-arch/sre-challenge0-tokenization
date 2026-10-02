# Challenge #0 (Tokenization) — Handoff for a fresh session

Status: **deployed + live**, pending: Git-linked green build + SpeedRun submission + mint XP.

## 1) Contract (Sepolia, chainId 11155111)
- Address: `0x59497b2F1f1AcEd69A8AeC9e0004B9Ee67B328B3`
- Owner/deployer: `0x953BaA88c280df9e59C149BC5aB9B9ec64E45323` (holds ~0.12 Sepolia ETH)
- Etherscan: https://sepolia.etherscan.io/address/0x59497b2F1f1AcEd69A8AeC9e0004B9Ee67B328B3
- Verified: **no** (optional). `solc-bin.ethereum.org` DNS failed (`ENOTFOUND`) during verification attempt. The link works for submission.

## 2) Live app
- **https://nextjs-one-pied-33.vercel.app** — 200 OK, title `Tokenization | Speedrun Ethereum`, JS bundle contains the contract address, no Hardhat banner.
- Also works: `/myNFTs` (mint), `/transfers`, `/blockexplorer` — all 200.

### Do NOT use these URLs
- `speedrun-tokenization.vercel.app` → old scaffold default (hardhat, no contract) — not ours.
- `tokenization.vercel.app`, `tokenization-challenge0.vercel.app`, `speedrun-tokenization-*.vercel.app` → belong to other accounts.

## 3) Vercel project
- Name: `sre-challenge0-tokenization`, id `prj_C9nkgquzlIAlVjpS4rU67cEa3i83`
- `rootDirectory` = `packages/nextjs`, framework `nextjs`, node 24.x
- `installCommand` = `npm install --legacy-peer-deps`, `buildCommand` = `next build`
- Deployment Protection (`ssoProtection`) was **disabled** so the site is public.
- Git link: `blockdns1-arch/sre-challenge0-tokenization` (production branch `main`) — NOT linked to `blockdns`.
- Latest Git-triggered deploy is **ERROR** (it ran while `rootDirectory` was empty). Fix = trigger a new build now that root is correct.
- Vercel CLI is authenticated; token lives in `C:\Users\pc\AppData\Roaming\com.vercel.cli\Data\auth.json`.

## 4) Repos (strict separation)
- Challenge repo: `blockdns1-arch/sre-challenge0-tokenization` (private), commit `8e1f180`
- Challenge was **purged from `blockdns` history** (force-push done, main head now `8f62332`).
- Never add challenge code back into `blockdns`. They must stay separate.
- `.github/workflows/` is gitignored in the challenge repo because the current GitHub PAT lacks the `workflow` scope.

## 5) Local folders
- Challenge: `C:\Users\pc\Desktop\sre-challenge0-tokenization` (git repo, PnP via Yarn 4)
  - `packages/nextjs` → `contracts/deployedContracts.ts` has `11155111: { YourCollectible: { address, abi } }`
  - `scaffold.config.ts` → `targetNetworks: [chains.sepolia]`, `burnerWalletMode: "allNetworks"`
  - Big ignored leftovers: `.next` (~510 MB), `node_modules.old` (~452 MB)
- Standalone Hardhat (used to deploy): `C:\Users\pc\AppData\Local\Temp\opencode\hh-sepolia`
  - Hardhat 2.22.19, ethers 5.7.2, OpenZeppelin 5.1.0, Sepolia config + deploy script
  - Private key source: `C:\Users\pc\Desktop\blockdns\base-deploy.env` (`BASE_DEPLOYER_PRIVATE_KEY`) — never print or commit
  - `scripts/mint.js` mints N NFTs (pins metadata via `https://speedrunethereum.com/api/ipfs/pin`, then `mintItem`), reading metadata from the app's `nftsMetadata.ts`. Temp dir may be cleaned — recreate if missing.

## 6) Build fix that matters (already applied)
`npm ci`/`npm install` failed with `npm error Invalid Version:` because of a corrupted lockfile, and `next build` failed on `Module not found: Can't resolve '@x402/evm'` (optional peer deps of `@coinbase/cdp-sdk`, pulled via wagmi → rainbowkit → baseAccount).
Fix: regenerate the lockfile + add `@x402/core`, `@x402/evm`, `@x402/svm` (^2.28.0) to `packages/nextjs/package.json`. With those, the production build passes.

## 7) Remaining steps (in this order)
1. Trigger/redeploy so the Git-linked project turns green, then confirm the production URL still returns 200 with the contract address in the bundle.
2. Mint NFTs for XP (3 is enough) with the deployer wallet — either via the UI (`/myNFTs` → Mint) or via `scripts/mint.js`.
3. Transfer one NFT so the `/transfers` page has a Transfer event (checkpoint).
4. Submit on speedrunethereum.com → Challenge 0:
   - Deployed URL: `https://nextjs-one-pied-33.vercel.app`
   - Testnet contract URL: `https://sepolia.etherscan.io/address/0x59497b2F1f1AcEd69A8AeC9e0004B9Ee67B328B3`
5. Score: +10 XP challenge, +5 first build, +1 Talent each submission.

## 8) Auth needed
- GitHub: no PAT is stored. Ask the user to paste one (`repo` scope is enough; `workflow` only if CI files must be pushed).
- Vercel: CLI already authenticated (see path above).
