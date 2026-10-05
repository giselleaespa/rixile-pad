import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, getTokenMetadata } from '@solana/spl-token'
import { getConnection } from '../lib/solana/connection'
import { DEMO_LAUNCHES, demoProgress } from '../lib/demoLaunches'
import { formatNumber, shortenAddress, formatCountdown } from '../lib/format'
import { NETWORK_LABEL, solscanUrl } from '../lib/config'
import BuyPanel from '../explore/BuyPanel'
import { TokenAvatar } from '../components/LaunchCard'
import { AlertIcon, ExternalIcon, ArrowRightIcon } from '../components/Icons'

interface OnchainMint {
  program: string
  decimals: number
  supply: string
  mintAuthority: string | null
  freezeAuthority: string | null
  metadataName?: string
  metadataSymbol?: string
  metadataUri?: string
}

type Loaded =
  | { kind: 'loading' }
  | { kind: 'notfound'; message: string }
  | { kind: 'demo' }
  | { kind: 'onchain'; data: OnchainMint }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

export default function TokenDetailPage() {
  const { mint = '' } = useParams()
  const [state, setState] = useState<Loaded>({ kind: 'loading' })

  const demo = DEMO_LAUNCHES.find((l) => l.id === mint)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (demo) {
        setState({ kind: 'demo' })
        return
      }
      setState({ kind: 'loading' })
      let pubkey: PublicKey
      try {
        pubkey = new PublicKey(mint)
      } catch {
        if (!cancelled) setState({ kind: 'notfound', message: 'This is not a valid Solana address.' })
        return
      }
      try {
        const connection = getConnection()
        const info = await connection.getParsedAccountInfo(pubkey)
        if (!cancelled && !info.value) {
          setState({ kind: 'notfound', message: 'No mint account found at this address on ' + NETWORK_LABEL.toLowerCase() + '.' })
          return
        }
        const ownerStr = info.value!.owner.toString()
        const programId = ownerStr === TOKEN_2022_PROGRAM_ID.toString() ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
        const program = ownerStr === TOKEN_2022_PROGRAM_ID.toString() ? 'Token-2022' : 'SPL Token'
        const m = await getMint(connection, pubkey, 'confirmed', programId)
        const data: OnchainMint = {
          program,
          decimals: m.decimals,
          supply: m.supply.toString(),
          mintAuthority: m.mintAuthority?.toBase58() ?? null,
          freezeAuthority: m.freezeAuthority?.toBase58() ?? null,
        }
        try {
          const meta = await getTokenMetadata(connection, pubkey, 'confirmed', programId)
          if (meta) {
            data.metadataName = meta.name.trim()
            data.metadataSymbol = meta.symbol.trim()
            data.metadataUri = meta.uri.trim()
          }
        } catch {
          /* mint without metadata is fine */
        }
        if (!cancelled) setState({ kind: 'onchain', data })
      } catch (e) {
        if (!cancelled) {
          setState({
            kind: 'notfound',
            message: e instanceof Error ? `Could not load the mint: ${e.message.slice(0, 140)}` : 'Could not load the mint.',
          })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint])

  if (state.kind === 'loading') {
    return (
      <div className="container page-enter" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <span className="btn-spinner" style={{ width: 20, height: 20, color: 'var(--muted)' }} aria-label="Loading" />
      </div>
    )
  }

  if (state.kind === 'notfound') {
    return (
      <div className="container page-enter" style={{ padding: '80px 24px', maxWidth: 520 }}>
        <div className="banner banner-danger" role="alert">
          <AlertIcon width={16} height={16} />
          <div>
            <div className="banner-title">Token not found</div>
            <div className="banner-body mono" style={{ fontSize: 12 }}>{state.message}</div>
          </div>
        </div>
        <Link to="/explore" className="btn btn-secondary" style={{ marginTop: 20 }}>
          Back to Explore
        </Link>
      </div>
    )
  }

  /* ---------------- Demo launch detail ---------------- */

  if (state.kind === 'demo') {
    const d = demo!
    const progress = demoProgress(d)
    const remaining = (d.endsAt ?? 0) - Date.now()
    return (
      <div className="container page-enter" style={{ padding: '36px 24px 80px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          <span className="chip chip-demo"><span className="dot" /> DEMO DATA — NOT A REAL TOKEN</span>
          {d.status === 'live' && <span className="chip chip-live"><span className="dot" /> Live</span>}
          {d.status === 'upcoming' && <span className="chip chip-upcoming"><span className="dot" style={{ background: 'var(--warning)' }} /> Upcoming</span>}
          {d.status === 'completed' && <span className="chip chip-completed"><span className="dot" /> Completed</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }} className="details-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <TokenAvatar symbol={d.symbol} accent={d.accent} size={64} />
                <div>
                  <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{d.name}</h1>
                  <div className="mono" style={{ color: 'var(--muted)', fontSize: 13 }}>${d.symbol}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-2)', marginTop: 16, fontSize: 14 }}>{d.description}</p>
              <p className="hint" style={{ marginTop: 10, fontSize: 12 }}>
                This is a sample launch used to demonstrate the RIXILE PAD explore experience. It is
                not backed by a real mint.
              </p>
            </div>

            <Section title="LAUNCH STATUS">
              <div className="progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="kv" style={{ marginTop: 10 }}><span className="k">Raised</span><span className="v mono">{d.raisedSol.toFixed(1)} / {d.targetSol.toFixed(0)} SOL</span></div>
              <div className="kv"><span className="k">Participants</span><span className="v mono">{d.participants}</span></div>
              <div className="kv"><span className="k">Current price</span><span className="v mono">{d.pricePerTokenSol} SOL</span></div>
              <div className="kv"><span className="k">Liquidity</span><span className="v mono">{d.liquiditySol.toFixed(1)} SOL</span></div>
              <div className="kv"><span className="k">Time remaining</span><span className="v mono">{d.status === 'completed' ? 'ended' : formatCountdown(remaining)}</span></div>
            </Section>

            <div className="banner banner-info">
              <div>
                <div className="banner-title">No chart available</div>
                <div className="banner-body">Price and chart visualizations appear only once real trading data exists. RIXILE PAD never fabricates market data.</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BuyPanel tokenName={d.name} />
            <Link to="/explore" className="btn btn-secondary btn-block">
              Back to Explore <ArrowRightIcon width={13} height={13} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- Real on-chain mint detail ---------------- */

  const data = state.data
  const supplyHuman = Number(data.supply) / 10 ** data.decimals

  return (
    <div className="container page-enter" style={{ padding: '36px 24px 80px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        <span className="chip chip-live"><span className="dot" /> On-chain</span>
        <span className="chip">{NETWORK_LABEL}</span>
        <span className="chip">{data.program}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }} className="details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <TokenAvatar symbol={data.metadataSymbol || 'TKN'} accent="var(--primary)" size={64} />
              <div>
                <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>{data.metadataName || 'Unnamed token'}</h1>
                <div className="mono" style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {data.metadataSymbol ? `$${data.metadataSymbol}` : 'no symbol metadata'}
                </div>
              </div>
            </div>
            {data.metadataUri && (
              <a href={data.metadataUri} target="_blank" rel="noreferrer" className="hint mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 16, fontSize: 12 }}>
                Metadata URI <ExternalIcon width={11} height={11} />
              </a>
            )}
          </div>

          <Section title="MINT DATA — LIVE FROM RPC">
            <div className="kv"><span className="k">Mint address</span><span className="v mono">{shortenAddress(mint, 8)}</span></div>
            <div className="kv"><span className="k">Decimals</span><span className="v mono">{data.decimals}</span></div>
            <div className="kv"><span className="k">Supply (raw)</span><span className="v mono">{formatNumber(BigInt(data.supply))}</span></div>
            <div className="kv"><span className="k">Supply (adjusted)</span><span className="v mono">{formatNumber(supplyHuman)}</span></div>
            <div className="kv"><span className="k">Mint authority</span><span className="v mono">{data.mintAuthority ? shortenAddress(data.mintAuthority, 6) : 'renounced'}</span></div>
            <div className="kv"><span className="k">Freeze authority</span><span className="v mono">{data.freezeAuthority ? shortenAddress(data.freezeAuthority, 6) : 'renounced'}</span></div>
            <div className="kv"><span className="k">Program</span><span className="v mono">{data.program}</span></div>
          </Section>

          <div className="banner banner-info">
            <div>
              <div className="banner-title">No market data yet</div>
              <div className="banner-body">
                Price, liquidity, market cap and charts appear only when the token has a trading
                pool. RIXILE PAD does not fabricate market data.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>LINKS</div>
            <a className="btn btn-secondary btn-block" href={solscanUrl('token', mint)} target="_blank" rel="noreferrer" style={{ marginBottom: 8 }}>
              View on Solscan <ExternalIcon width={13} height={13} />
            </a>
            <div className="kv"><span className="k">Price</span><span className="v mono">—</span></div>
            <div className="kv"><span className="k">Liquidity</span><span className="v mono">—</span></div>
            <div className="kv"><span className="k">Market cap</span><span className="v mono">—</span></div>
          </div>
          <BuyPanel tokenName={data.metadataName || 'This token'} />
          <Link to="/explore" className="btn btn-ghost btn-block">
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
