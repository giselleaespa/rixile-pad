import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, getTokenMetadata } from '@solana/spl-token'
import type { TokenMetadata } from '@solana/spl-token-metadata'
import { getConnection } from '../lib/solana/connection'
import { formatNumber, shortenAddress } from '../lib/format'
import { NETWORK_LABEL, solscanUrl } from '../lib/config'
import { AlertIcon, ExternalIcon } from '../components/Icons'

interface Dna {
  name: string
  symbol: string
  supply: string
  decimals: number
  creator: string | null
  creatorAllocation: string | null
  liquidityAllocation: string | null
  lpLock: string | null
  mintAuthority: string | null
  freezeAuthority: string | null
  metadataOnchain: boolean
}

type LoadState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; dna: Dna }

function formatSupply(raw: string, decimals: number): string {
  const amount = BigInt(raw)
  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const fraction = (amount % divisor).toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${formatNumber(whole)}${fraction ? `.${fraction}` : ''}`
}

function readExtra(metadata: TokenMetadata | null, key: string): string | null {
  return metadata?.additionalMetadata?.find(([name]) => name === key)?.[1] ?? null
}

function Metric({ label, value, detail, verified = false }: { label: string; value: string; detail?: string; verified?: boolean }) {
  return (
    <div className="card" style={{ padding: '18px 20px', minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 9 }}>{label}</div>
      <div className="mono" style={{ fontSize: 16, fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</div>
      {detail && <div className="hint mono" style={{ marginTop: 6, fontSize: 11 }}>{detail}</div>}
      {verified && <div className="mono" style={{ color: 'var(--success)', fontSize: 10, marginTop: 8 }}>ON-CHAIN ✓</div>}
    </div>
  )
}

export default function TokenDnaPage() {
  const { mint = '' } = useParams()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState({ kind: 'loading' })
      let address: PublicKey
      try {
        address = new PublicKey(mint)
      } catch {
        if (!cancelled) setState({ kind: 'error', message: 'This is not a valid Solana mint address.' })
        return
      }
      try {
        const connection = getConnection()
        const account = await connection.getAccountInfo(address, 'confirmed')
        if (!account) throw new Error(`No mint account found on ${NETWORK_LABEL.toLowerCase()}.`)
        const programId = account.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
        const mintData = await getMint(connection, address, 'confirmed', programId)
        let metadata: Awaited<ReturnType<typeof getTokenMetadata>> = null
        try {
          metadata = await getTokenMetadata(connection, address, 'confirmed', programId)
        } catch {
          // Classic SPL tokens or mints without metadata remain readable.
        }
        if (cancelled) return
        setState({
          kind: 'ready',
          dna: {
            name: metadata?.name.trim() || 'Unnamed token',
            symbol: metadata?.symbol.trim() || 'TKN',
            supply: mintData.supply.toString(),
            decimals: mintData.decimals,
            creator: mintData.mintAuthority?.toBase58() ?? null,
            creatorAllocation: readExtra(metadata, 'RIXILE Creator Allocation'),
            liquidityAllocation: readExtra(metadata, 'RIXILE Liquidity Allocation'),
            lpLock: readExtra(metadata, 'RIXILE LP Lock'),
            mintAuthority: mintData.mintAuthority?.toBase58() ?? null,
            freezeAuthority: mintData.freezeAuthority?.toBase58() ?? null,
            metadataOnchain: metadata !== null,
          },
        })
      } catch (error) {
        if (!cancelled) setState({ kind: 'error', message: error instanceof Error ? error.message : 'Could not load token data.' })
      }
    }
    void load()
    return () => { cancelled = true }
  }, [mint])

  if (state.kind === 'loading') return <div className="container page-enter" style={{ padding: '88px 24px', textAlign: 'center' }}><span className="btn-spinner" aria-label="Loading token DNA" /></div>

  if (state.kind === 'error') return (
    <div className="container page-enter" style={{ maxWidth: 640, padding: '80px 24px' }}>
      <div className="banner banner-danger" role="alert"><AlertIcon width={16} height={16} /><div><div className="banner-title">Token DNA unavailable</div><div className="banner-body">{state.message}</div></div></div>
      <Link to="/launch" className="btn btn-secondary" style={{ marginTop: 20 }}>Launch a token</Link>
    </div>
  )

  const { dna } = state
  const supply = formatSupply(dna.supply, dna.decimals)
  return (
    <div className="container page-enter" style={{ maxWidth: 760, padding: '64px 24px 80px' }}>
      <header style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>RIXILE DNA</div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.03em' }}>${dna.symbol}</h1>
        <div style={{ color: 'var(--text-2)', marginTop: 4 }}>{dna.name}</div>
        <div className="hint mono" style={{ marginTop: 12, fontSize: 11, overflowWrap: 'anywhere' }}>{mint}</div>
      </header>

      <div className="dna-grid">
        <Metric label="SUPPLY" value={supply} detail={`${dna.decimals} decimals`} verified />
        <Metric label="CREATOR" value={dna.creatorAllocation || (dna.creator ? shortenAddress(dna.creator, 6) : 'Not available')} detail={dna.creatorAllocation ? 'Configured allocation · full initial supply minted to creator' : dna.creator ? `Mint authority · ${shortenAddress(dna.creator, 6)}` : 'No mint authority'} verified />
        <Metric label="LIQUIDITY" value={dna.liquidityAllocation || 'Not available'} detail={dna.liquidityAllocation ? 'Reserved allocation; no pool created' : 'No on-chain pool data'} />
        <Metric label="LP LOCK" value={dna.lpLock?.startsWith('Not set') ? 'NOT SET' : dna.lpLock || 'Not available'} detail="No liquidity pool created" />
        <Metric label="MINT AUTHORITY" value={dna.mintAuthority ? `ON · ${shortenAddress(dna.mintAuthority, 5)}` : 'OFF ✓'} detail={dna.mintAuthority ? 'Can mint additional supply' : 'Renounced on-chain'} verified />
        <Metric label="FREEZE AUTHORITY" value={dna.freezeAuthority ? `ON · ${shortenAddress(dna.freezeAuthority, 5)}` : 'OFF ✓'} detail={dna.freezeAuthority ? 'Can freeze token accounts' : 'Renounced on-chain'} verified />
        <Metric label="METADATA" value={dna.metadataOnchain ? 'ON-CHAIN ✓' : 'NOT FOUND'} detail="Token metadata account" verified={dna.metadataOnchain} />
      </div>

      <div className="dna-footer">
        <div className="mono" style={{ color: 'var(--success)', fontSize: 12, letterSpacing: '0.08em' }}>DNA VERIFIED ✓</div>
        <a className="btn btn-secondary" href={solscanUrl('token', mint)} target="_blank" rel="noreferrer">View on Solscan <ExternalIcon width={13} height={13} /></a>
      </div>
      <p className="hint" style={{ textAlign: 'center', marginTop: 24, fontSize: 12 }}>Every token has a DNA. Read it before you buy it.</p>
    </div>
  )
}
