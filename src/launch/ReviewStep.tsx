import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import type { TokenForm } from './tokenForm'
import { prepareTokenDeployment } from '../lib/solana/tokenDeploy'
import { NETWORK_LABEL } from '../lib/config'
import { formatLamportsSol, formatNumber, shortenAddress } from '../lib/format'
import { AlertIcon, WalletIcon } from '../components/Icons'
import { TokenAvatar } from '../components/LaunchCard'

interface Props {
  form: TokenForm
  imagePreview: string
}

export default function ReviewStep({ form, imagePreview }: Props) {
  const { publicKey, connected } = useWallet()
  const [estimate, setEstimate] = useState<number | null>(null)
  const [estimateError, setEstimateError] = useState('')

  useEffect(() => {
    let cancelled = false
    // Real estimate: rent for the mint (with metadata) + ATA + tx fee, from the live RPC.
    async function run() {
      if (!publicKey) return
      try {
        setEstimateError('')
        const p = await prepareTokenDeployment(publicKey, {
          name: form.name,
          symbol: form.symbol.toUpperCase(),
          uri: form.imageUrl.trim(),
          decimals: Number(form.decimals),
          initialSupply: Number(form.initialSupply),
          creatorAllocationPct: Number(form.creatorPct),
          liquidityAllocationPct: Number(form.liquidityPct),
        })
        if (!cancelled) setEstimate(p.estimatedLamports)
      } catch (e) {
        if (!cancelled) setEstimateError(e instanceof Error ? e.message : 'Could not fetch fee estimate.')
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [publicKey, form.name, form.symbol, form.imageUrl, form.decimals, form.initialSupply])

  const symbol = form.symbol.toUpperCase()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 28 }} className="details-grid">
      <div className="card" style={{ padding: 26 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>CONFIGURATION SUMMARY</div>
        <div className="kv"><span className="k">Token</span><span className="v">{form.name.trim()}</span></div>
        <div className="kv"><span className="k">Symbol</span><span className="v mono">${symbol}</span></div>
        <div className="kv"><span className="k">Total Supply</span><span className="v mono">{formatNumber(Number(form.totalSupply) || 0)}</span></div>
        <div className="kv"><span className="k">Initial Supply</span><span className="v mono">{formatNumber(Number(form.initialSupply) || 0)}</span></div>
        <div className="kv"><span className="k">Decimals</span><span className="v mono">{form.decimals}</span></div>
        <div className="kv"><span className="k">Creator Allocation</span><span className="v mono">{form.creatorPct}%</span></div>
        <div className="kv"><span className="k">Liquidity Allocation</span><span className="v mono">{form.liquidityPct}%</span></div>
        <div className="kv"><span className="k">Network</span><span className="v mono">{NETWORK_LABEL}</span></div>
        <div className="kv">
          <span className="k">Estimated Network Fee</span>
          <span className="v mono" style={{ color: estimateError ? 'var(--danger)' : undefined }}>
            {estimateError
              ? 'unavailable'
              : estimate === null
                ? 'calculating…'
                : formatLamportsSol(estimate, 5)}
          </span>
        </div>
        <div className="kv">
          <span className="k">Metadata</span>
          <span className="v" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
            Name &amp; symbol written on-chain (Token-2022).{form.imageUrl.trim() ? ' Image URL included.' : ' No image URL set.'}
          </span>
        </div>
        <div className="kv">
          <span className="k">Creator Wallet</span>
          <span className="v mono">{publicKey ? shortenAddress(publicKey.toBase58(), 6) : 'not connected'}</span>
        </div>
        <div className="kv">
          <span className="k">Token Program</span>
          <span className="v mono" style={{ fontSize: 12 }}>Token-2022</span>
        </div>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>YOUR TOKEN</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
            {imagePreview ? (
              <img src={imagePreview} alt="" style={{ width: 72, height: 72, borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }} />
            ) : (
              <TokenAvatar symbol={symbol || 'XXX'} accent="var(--primary)" size={72} />
            )}
            <div>
              <div style={{ fontWeight: 650 }}>{form.name.trim() || '—'}</div>
              <div className="mono" style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>${symbol}</div>
            </div>
          </div>
        </div>

        <div className="banner banner-warn" role="note">
          <AlertIcon width={16} height={16} />
          <div>
            <div className="banner-title">You will be asked to approve a transaction in your wallet.</div>
            <div className="banner-body">
              Review every value before continuing. The transaction creates the mint, writes
              metadata and mints the initial supply to your wallet.
            </div>
          </div>
        </div>

        {!connected && (
          <div className="banner banner-info">
            <WalletIcon width={16} height={16} />
            <div>
              <div className="banner-title">Connect your wallet</div>
              <div className="banner-body">Use the Connect Wallet button in the navbar to continue.</div>
            </div>
          </div>
        )}

        {estimateError && (
          <div className="banner banner-danger" role="alert">
            <AlertIcon width={16} height={16} />
            <div>
              <div className="banner-title">Fee estimate failed</div>
              <div className="banner-body">{estimateError}</div>
            </div>
          </div>
        )}

      </aside>
    </div>
  )
}
