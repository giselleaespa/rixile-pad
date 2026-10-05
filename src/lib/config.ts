import { clusterApiUrl } from '@solana/web3.js'

export type Network = 'devnet' | 'mainnet-beta'

const rawNetwork = (import.meta.env.VITE_SOLANA_NETWORK as string | undefined)?.toLowerCase()

export const NETWORK: Network = rawNetwork === 'mainnet-beta' ? 'mainnet-beta' : 'devnet'

export const RPC_ENDPOINT: string =
  (import.meta.env.VITE_SOLANA_RPC_URL as string | undefined) || clusterApiUrl(NETWORK)

export const IS_DEVNET = NETWORK === 'devnet'

export const NETWORK_LABEL = NETWORK === 'devnet' ? 'SOLANA DEVNET' : 'SOLANA MAINNET-BETA'

export const BRAND = 'RIXILE PAD'

export function solscanUrl(kind: 'token' | 'tx', address: string): string {
  const cluster = NETWORK === 'devnet' ? '?cluster=devnet' : ''
  return `https://solscan.io/${kind === 'token' ? 'token' : 'tx'}/${address}${cluster}`
}
