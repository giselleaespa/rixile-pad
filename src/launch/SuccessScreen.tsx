import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DeployResult } from './DeployStep'
import type { TokenForm } from './tokenForm'
import { NETWORK_LABEL } from '../lib/config'
import { shortenAddress } from '../lib/format'
import Rixile3D from '../components/Rixile3D'
import { CheckIcon, CopyIcon, ExternalIcon } from '../components/Icons'

interface Props {
  result: DeployResult
  form: TokenForm
  onRestart: () => void
}

export default function SuccessScreen({ result, form, onRestart }: Props) {
  const [copied, setCopied] = useState<'mint' | 'tx' | null>(null)

  const copy = async (which: 'mint' | 'tx') => {
    const value = which === 'mint' ? result.mintAddress : result.signature
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
      setTimeout(() => setCopied(null), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 0 72px' }}>
      <div className="banner banner-success" style={{ marginBottom: 24 }} role="status">
        <CheckIcon width={16} height={16} />
        <span className="banner-title mono" style={{ letterSpacing: '0.1em', fontSize: 12 }}>TOKEN CREATED</span>
      </div>

      <div aria-hidden="true" style={{ marginBottom: 8 }}>
        <Rixile3D size={280} />
      </div>

      <h2 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>{form.name.trim()}</h2>
      <div className="mono" style={{ color: 'var(--muted)', marginTop: 4 }}>${form.symbol.toUpperCase()}</div>

      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 24, marginTop: 28, textAlign: 'left' }}>
        <div className="kv">
          <span className="k">Mint Address</span>
          <span className="v mono">{shortenAddress(result.mintAddress, 6)}</span>
        </div>
        <div className="kv">
          <span className="k">Transaction</span>
          <span className="v mono">{shortenAddress(result.signature, 6)}</span>
        </div>
        <div className="kv">
          <span className="k">Network</span>
          <span className="v mono">{NETWORK_LABEL}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 460, marginTop: 18 }} className="success-actions">
        <a className="btn btn-primary" href={result.solscanToken} target="_blank" rel="noreferrer">
          View on Solscan <ExternalIcon width={13} height={13} />
        </a>
        <Link className="btn btn-secondary" to={`/dna/${result.mintAddress}`}>
          View Token DNA
        </Link>
        <a className="btn btn-secondary" href={result.solscanTx} target="_blank" rel="noreferrer">
          View Transaction <ExternalIcon width={13} height={13} />
        </a>
        <button className="btn btn-secondary" onClick={() => copy('mint')}>
          {copied === 'mint' ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
          {copied === 'mint' ? 'Copied' : 'Copy Mint Address'}
        </button>
        <button className="btn btn-secondary" onClick={() => copy('tx')}>
          {copied === 'tx' ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
          {copied === 'tx' ? 'Copied' : 'Copy Transaction'}
        </button>
      </div>

      <p className="hint" style={{ marginTop: 20, maxWidth: 440, lineHeight: 1.6 }}>
        The token was created by a real transaction confirmed by the Solana network. The mint
        address above is live on {NETWORK_LABEL.toLowerCase()} and can be verified on Solscan. Pool
        creation and public trading are not yet part of RIXILE PAD.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
        <button className="btn btn-secondary" onClick={onRestart}>
          Launch Another Token
        </button>
        <Link to="/explore" className="btn btn-ghost">
          Explore launches
        </Link>
      </div>
    </div>
  )
}
