import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { formatSol } from '../lib/format'
import { WalletIcon, InfoIcon } from '../components/Icons'
import { useSolBalance } from '../wallet/useSolBalance'

/**
 * Participation panel — UI architecture is ready, but RIXILE PAD does not yet
 * have an on-chain bonding-curve / pool program. Purchases are therefore
 * clearly labeled unavailable rather than faked.
 */
export default function BuyPanel({ tokenName }: { tokenName: string }) {
  const { publicKey, connected } = useWallet()
  const { balance } = useSolBalance()
  const [amount, setAmount] = useState('')

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>PARTICIPATE</div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="label" htmlFor="buy-amount">Amount of SOL</label>
        <input
          id="buy-amount"
          className="input mono"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled
        />
      </div>

      <div className="kv"><span className="k">Estimated tokens</span><span className="v mono">—</span></div>
      <div className="kv"><span className="k">Price impact</span><span className="v mono">—</span></div>
      <div className="kv"><span className="k">Network fee</span><span className="v mono">—</span></div>
      <div className="kv"><span className="k">Your balance</span><span className="v mono">{connected && balance !== null ? formatSol(balance) : connected ? '—' : 'not connected'}</span></div>

      <div className="banner banner-warn" style={{ marginTop: 16, fontSize: 12.5 }} role="note">
        <InfoIcon width={15} height={15} />
        <div>
          <div className="banner-title">Participation not yet available</div>
          <div className="banner-body">
            Buying into launches requires the RIXILE bonding-curve program, which is not deployed
            yet. This panel is wired to the wallet layer and will activate with the on-chain
            program — no simulated purchases.
          </div>
        </div>
      </div>

      {connected && publicKey ? (
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 14 }} disabled aria-disabled="true">
          Buy Tokens — coming with the curve program
        </button>
      ) : (
        <button className="btn btn-secondary btn-block btn-lg" style={{ marginTop: 14 }} disabled aria-disabled="true" title="Connect your wallet first">
          <WalletIcon width={14} height={14} /> Connect Wallet to participate
        </button>
      )}

      <p className="hint" style={{ marginTop: 12, textAlign: 'center', fontSize: 11.5 }}>
        {tokenName} · every real purchase will always require explicit wallet approval.
      </p>
    </div>
  )
}
