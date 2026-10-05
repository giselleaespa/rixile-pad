/**
 * Real end-to-end devnet verification of the RIXILE PAD token deployment stack.
 * Builds the same Token-2022 transaction the app builds, signs with a throwaway
 * keypair funded by the devnet faucet, and confirms on-chain.
 * Run: node scripts/devnet-e2e.mjs
 */
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
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
  getMint,
  getTokenMetadata,
  getAccount,
} from '@solana/spl-token'
import { pack } from '@solana/spl-token-metadata'

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

const payer = Keypair.generate()
console.log('Payer:', payer.publicKey.toBase58())

console.log('Requesting airdrop (1 SOL) via faucet.solana.com...')
let airdropSig = null
for (let i = 0; i < 6; i++) {
  try {
    const res = await fetch('https://faucet.solana.com/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: payer.publicKey.toBase58(), amount: 1, network: 'devnet' }),
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const json = await res.json()
    airdropSig = json?.signature ?? null
    if (!airdropSig) throw new Error('no signature in faucet response')
    break
  } catch (e) {
    console.log(`  attempt ${i + 1} failed (${String(e.message).slice(0, 60)}), retrying in 6s...`)
    await new Promise((r) => setTimeout(r, 6000))
  }
}
if (!airdropSig) {
  // Fallback to the RPC airdrop
  try {
    airdropSig = await connection.requestAirdrop(payer.publicKey, 1 * LAMPORTS_PER_SOL)
  } catch {
    console.error('Faucet unavailable after retries. Fund', payer.publicKey.toBase58(), 'on https://faucet.solana.com and rerun.')
    process.exit(2)
  }
}
const latest = await connection.getLatestBlockhash()
await connection.confirmTransaction({ signature: airdropSig, ...latest }, 'confirmed')
console.log('Airdrop confirmed:', airdropSig)

const mint = Keypair.generate()
const ata = getAssociatedTokenAddressSync(mint.publicKey, payer, false, TOKEN_2022_PROGRAM_ID)

const name = 'Rixile E2E Test'
const symbol = 'RE2E'
const uri = ''
const decimals = 9
const initialSupply = 1000000000n

const metadata = { mint: mint.publicKey, name, symbol, uri, additionalMetadata: [] }
const mintLen = getMintLen([ExtensionType.MetadataPointer])
const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen)
console.log('Mint rent:', lamports, 'lamports')

const tx = new Transaction({ feePayer: payer.publicKey }).add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
  createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
  createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint.publicKey,
    updateAuthority: payer.publicKey,
    mint: mint.publicKey,
    mintAuthority: payer.publicKey,
    name,
    symbol,
    uri,
  }),
  createAssociatedTokenAccountInstruction(payer.publicKey, ata, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
  createMintToInstruction(mint.publicKey, ata, payer.publicKey, initialSupply * 10n ** BigInt(decimals), [], TOKEN_2022_PROGRAM_ID),
)

console.log('Sending transaction...')
const signature = await sendAndConfirmTransaction(connection, tx, [payer, mint])
console.log('SIGNATURE:', signature)
console.log('MINT:', mint.publicKey.toBase58())
console.log('TX: https://solscan.io/tx/' + signature + '?cluster=devnet')
console.log('TOKEN: https://solscan.io/token/' + mint.publicKey.toBase58() + '?cluster=devnet')

// Verify on-chain state with fresh RPC reads
const mintInfo = await getMint(connection, mint.publicKey, 'confirmed', TOKEN_2022_PROGRAM_ID)
console.log('On-chain decimals:', mintInfo.decimals)
console.log('On-chain supply (raw):', mintInfo.supply.toString())
const meta = await getTokenMetadata(connection, mint.publicKey, 'confirmed', TOKEN_2022_PROGRAM_ID)
console.log('On-chain metadata name:', JSON.stringify(meta.name))
console.log('On-chain metadata symbol:', JSON.stringify(meta.symbol))
console.log('Freeze authority:', mintInfo.freezeAuthority?.toBase58() ?? null)
const account = await getAccount(connection, ata, 'confirmed', TOKEN_2022_PROGRAM_ID)
console.log('ATA balance (raw):', account.amount.toString())
console.log('E2E OK')
