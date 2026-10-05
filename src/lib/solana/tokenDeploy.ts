import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  getAssociatedTokenAddressSync,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token'
import { createUpdateFieldInstruction, pack } from '@solana/spl-token-metadata'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { getConnection } from './connection'

export interface TokenDeployParams {
  name: string
  symbol: string
  uri: string
  decimals: number
  /** Human-readable initial supply, e.g. 1_000_000_000 */
  initialSupply: number
  creatorAllocationPct: number
  liquidityAllocationPct: number
  /** Owner = wallet that pays, receives the supply and keeps mint authority */
}

export interface PreparedDeployment {
  mint: Keypair
  mintAddress: string
  ataAddress: string
  transaction: Transaction
  blockhash: string
  lastValidBlockHeight: number
  /** Real rent + fee estimate fetched from the cluster, in lamports */
  estimatedLamports: number
  mintLamports: number
  ataLamports: number
  feeLamports: number
}

const LAMPORTS_PER_SIGNATURE = 5_000
const ATA_SIZE = 165

export function tokenUnits(initialSupply: number, decimals: number): bigint {
  return BigInt(Math.round(initialSupply)) * 10n ** BigInt(decimals)
}

/**
 * Builds the REAL Token-2022 creation transaction:
 * create mint account -> init metadata pointer -> init mint (Token-2022)
 * -> write on-chain metadata (name/symbol/uri) -> create ATA -> mint initial supply.
 * Freeze authority is intentionally renounced; mint authority stays with the creator.
 */
export async function prepareTokenDeployment(
  payer: PublicKey,
  params: TokenDeployParams,
): Promise<PreparedDeployment> {
  const connection = getConnection()

  if (params.name.trim().length === 0 || params.name.trim().length > 32) {
    throw new Error('Invalid token name: must be 1-32 characters')
  }
  if (!/^[A-Z0-9]{1,10}$/.test(params.symbol.trim())) {
    throw new Error('Invalid token symbol: must be 1-10 uppercase letters or digits')
  }
  if (!Number.isInteger(params.decimals) || params.decimals < 0 || params.decimals > 9) {
    throw new Error('Invalid decimals: must be an integer between 0 and 9')
  }
  if (!(params.initialSupply > 0) || params.initialSupply > 1e15) {
    throw new Error('Invalid initial supply')
  }

  const mint = Keypair.generate()
  const ata = getAssociatedTokenAddressSync(mint.publicKey, payer, false, TOKEN_2022_PROGRAM_ID)

  const metadata = {
    mint: mint.publicKey,
    name: params.name.trim(),
    symbol: params.symbol.trim(),
    uri: params.uri.trim(),
    additionalMetadata: [
      ['RIXILE Creator Allocation', `${params.creatorAllocationPct}%`],
      ['RIXILE Liquidity Allocation', `${params.liquidityAllocationPct}% (reserved; no pool created)`],
      ['RIXILE LP Lock', 'Not set (no pool created)'],
    ] as [string, string][],
  }

  const mintLen = getMintLen([ExtensionType.MetadataPointer])
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length

  const [mintLamports, ataLamports, { blockhash, lastValidBlockHeight }] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(mintLen + metadataLen),
    connection.getMinimumBalanceForRentExemption(ATA_SIZE),
    connection.getLatestBlockhash('confirmed'),
  ])

  const feeLamports = LAMPORTS_PER_SIGNATURE * 2 // create+sign tx (ATA rent is paid inside the same tx by payer, no extra signature fee)

  const transaction = new Transaction({ feePayer: payer, blockhash, lastValidBlockHeight }).add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: mintLen + metadataLen,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mint.publicKey,
      payer,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(mint.publicKey, params.decimals, payer, null, TOKEN_2022_PROGRAM_ID),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint.publicKey,
      updateAuthority: payer,
      mint: mint.publicKey,
      mintAuthority: payer,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    }),
    ...metadata.additionalMetadata.map(([field, value]) => createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint.publicKey,
      updateAuthority: payer,
      field,
      value,
    })),
    createAssociatedTokenAccountInstruction(payer, ata, payer, mint.publicKey, TOKEN_2022_PROGRAM_ID),
    createMintToInstruction(
      mint.publicKey,
      ata,
      payer,
      tokenUnits(params.initialSupply, params.decimals),
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  )

  return {
    mint,
    mintAddress: mint.publicKey.toBase58(),
    ataAddress: ata.toBase58(),
    transaction,
    blockhash,
    lastValidBlockHeight,
    estimatedLamports: mintLamports + ataLamports + feeLamports,
    mintLamports,
    ataLamports,
    feeLamports,
  }
}

export interface ConfirmResult {
  confirmed: boolean
  slot?: number
}

/** Confirms a signature with a bounded timeout so the UI never hangs forever. */
export async function confirmSignature(
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  timeoutMs = 90_000,
): Promise<ConfirmResult> {
  const connection = getConnection()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
  }, timeoutMs)

  try {
    // Poll confirmSignatureStatus to distinguish "still pending" from failure.
    for (;;) {
      if (timedOut) return { confirmed: false }
      try {
        const res = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          'confirmed',
        )
        if (res.value.err) return { confirmed: false }
        return { confirmed: true, slot: res.context.slot }
      } catch (err) {
        if (timedOut) return { confirmed: false }
        // Transient RPC hiccups: keep polling until timeout.
        if (err instanceof Error && /not found|not still being|didn't reach/i.test(err.message)) {
          await sleep(1_500)
          continue
        }
        await sleep(1_500)
      }
    }
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
