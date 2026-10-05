import { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { shortenAddress, formatSol } from '../lib/format'
import { NETWORK_LABEL } from '../lib/config'
import { getConnection } from '../lib/solana/connection'
import { useSolBalance } from '../wallet/useSolBalance'
import { useDismiss } from '../wallet/useTheme'
import { WalletIcon, XIcon, CheckIcon, ChevronDownIcon } from './Icons'

function WalletIconImg({ src, size = 20 }: { src: string; size?: number }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 6, display: 'block' }}
    />
  )
}

function ConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { wallets, select, connecting } = useWallet()
  useDismiss(open, onClose)
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(9, 9, 11, 0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        data-dismiss-root
        className="card reveal-in"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 20,
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="eyebrow" style={{ margin: 0 }}>CONNECT WALLET</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>
        <p className="hint" style={{ marginBottom: 16 }}>
          Connecting is read-only until you approve a transaction. RIXILE PAD never asks for seed
          phrases or private keys.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {wallets.map((w) => {
            const ready = w.readyState === 'Installed' || w.readyState === 'Loadable'
            return (
              <button
                key={w.adapter.name}
                className="btn btn-secondary btn-block"
                style={{ justifyContent: 'space-between', height: 48 }}
                disabled={!ready || connecting}
                onClick={() => {
                  select(w.adapter.name)
                  onClose()
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <WalletIconImg src={w.adapter.icon} />
                  <span style={{ fontWeight: 500 }}>
                    {w.adapter.name}
                    {connecting ? ' — connecting…' : ''}
                  </span>
                </span>
                {ready ? <CheckIcon style={{ color: 'var(--success)' }} /> : <span className="hint">Not installed</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function WalletButton() {
  const { publicKey, wallet, connect, disconnect, connecting, connected } = useWallet()
  const { balance, loading, refresh } = useSolBalance()
  const { connection } = useConnection()
  const [modalOpen, setModalOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [airdropState, setAirdropState] = useState<'idle' | 'loading' | 'error'>('idle')

  // After an explicit selection (or a persisted wallet on revisit), connect.
  // Reconnects to already-authorized wallets are silent; locked wallets surface their own prompt.
  useEffect(() => {
    if (!wallet || connected || connecting) return
    connect().catch(() => {})
  }, [wallet]) // eslint-disable-line react-hooks/exhaustive-deps

  useDismiss(popoverOpen, () => setPopoverOpen(false))

  if (!publicKey || !wallet) {
    return (
      <>
        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
          disabled={connecting}
        >
          {connecting ? <span className="btn-spinner" /> : <WalletIcon width={15} height={15} />}
          Connect Wallet
        </button>
        <ConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    )
  }

  const address = publicKey.toBase58()

  return (
    <div style={{ position: 'relative' }} data-dismiss-root>
      <button
        className="btn btn-secondary"
        onClick={() => setPopoverOpen((o) => !o)}
        aria-expanded={popoverOpen}
        aria-haspopup="dialog"
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--success)',
            flex: 'none',
          }}
        />
        <span className="mono" style={{ fontSize: 12.5 }}>{shortenAddress(address)}</span>
        <ChevronDownIcon width={13} height={13} style={{ color: 'var(--muted)' }} />
      </button>

      {popoverOpen && (
        <div
          role="dialog"
          aria-label="Wallet"
          className="card reveal-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 296,
            padding: 18,
            boxShadow: 'var(--shadow-pop)',
            zIndex: 90,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 10 }}>WALLET</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600, overflowWrap: 'anywhere', marginBottom: 14 }}>
            {address}
          </div>
          <div className="kv"><span className="k">Balance</span><span className="v mono">{loading ? '—' : balance === null ? '—' : formatSol(balance)}</span></div>
          <div className="kv"><span className="k">Network</span><span className="v mono" style={{ fontSize: 12 }}>{NETWORK_LABEL}</span></div>
          <button
            className="btn btn-ghost btn-sm btn-block"
            style={{ marginTop: 10 }}
            disabled={airdropState === 'loading'}
            onClick={async () => {
              setAirdropState('loading')
              try {
                const sig = await connection.requestAirdrop(publicKey, 1_000_000_000)
                await getConnection().confirmTransaction(sig, 'confirmed')
                await refresh()
                setAirdropState('idle')
              } catch {
                setAirdropState('error')
              }
            }}
          >
            {airdropState === 'loading' ? <span className="btn-spinner" /> : null}
            {airdropState === 'loading' ? 'Requesting…' : 'Request 1 devnet SOL'}
          </button>
          {airdropState === 'error' && (
            <p className="error-text" style={{ marginTop: 6 }}>
              Faucet rate-limited. Try again in a few minutes or use faucet.solana.com.
            </p>
          )}
          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 14 }}
            onClick={() => {
              setPopoverOpen(false)
              disconnect().catch(() => {})
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
