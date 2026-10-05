import { Connection } from '@solana/web3.js'
import { RPC_ENDPOINT } from '../config'

let cached: Connection | null = null

export function getConnection(): Connection {
  if (!cached || cached.rpcEndpoint !== RPC_ENDPOINT) {
    cached = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' })
  }
  return cached
}
