# RIXILE PAD

React + TypeScript + Vite Solana token launchpad.

## Local development

1. Install Node.js (LTS).
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and set the desired Solana cluster.
4. Run `npm run dev`.

## Production build

Run `npm ci` followed by `npm run build`. Vite writes the static site to `dist/`.

## Deploy to Vercel

Import this project into Vercel with these build settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

Set `VITE_SOLANA_NETWORK` to `mainnet-beta` for mainnet or `devnet` for testing. Optionally set `VITE_SOLANA_RPC_URL` to a reliable RPC endpoint for that cluster. These `VITE_` values are included in the public browser bundle; never put wallet seed phrases, private keys, or other secrets in them.

The Vercel rewrite serves the SPA entry point on direct visits to routes such as `/dna/<mint-address>`. The app reads token mint and on-chain metadata from the configured Solana cluster, so share links work without a connected wallet. Keep the selected network and RPC endpoint consistent with the tokens you want visitors to inspect.

## Routes

- `/` — home
- `/launch` — token launch flow
- `/explore` — launches
- `/token/:mint` — token page
- `/dna/:mint` — public Token DNA identity page
