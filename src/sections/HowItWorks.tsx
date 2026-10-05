import Reveal from '../components/Reveal'
import { WalletIcon, ChartIcon, ZapIcon, ShieldIcon, LockIcon, LayersIcon } from '../components/Icons'

const STEPS = [
  {
    icon: <WalletIcon />,
    title: 'Connect wallet',
    body: 'Securely connect your Solana wallet in one click. Phantom and Solflare supported.',
  },
  {
    icon: <ChartIcon />,
    title: 'Configure tokenomics',
    body: 'Set supply, decimals and allocation with full precision and live validation.',
  },
  {
    icon: <ZapIcon />,
    title: 'Deploy on-chain',
    body: 'Approve one real transaction. Your SPL token mint is created on Solana directly.',
  },
  {
    icon: <LayersIcon />,
    title: 'Verify & share',
    body: 'Get the real mint address and transaction signature, verifiable on Solscan instantly.',
  },
]

const FEATURES = [
  {
    icon: <ChartIcon />,
    title: 'Real SPL deployment',
    body: 'Tokens are created with the Token-2022 program directly by your wallet. No custody, no middleman.',
  },
  {
    icon: <ShieldIcon />,
    title: 'On-chain metadata',
    body: 'Name, symbol and metadata are written on the mint itself — verifiable by any explorer.',
  },
  {
    icon: <LockIcon />,
    title: 'Non-custodial by design',
    body: 'Your keys stay in your wallet. Every transaction requires your explicit approval.',
  },
  {
    icon: <ZapIcon />,
    title: 'Instant supply mint',
    body: 'The initial supply is minted to your own associated token account in the same transaction.',
  },
  {
    icon: <LayersIcon />,
    title: 'Transparent mechanics',
    body: 'Rent, fees and allocations are shown before you sign. What you see is what gets executed.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Freeze authority renounced',
    body: 'Mint authority stays with you; freeze authority is renounced at creation for safer launches.',
  },
]

export default function HowItWorks() {
  return (
    <>
      <section className="section" id="how-it-works">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">PROCESS</p>
              <h2 className="section-title">Simple, technical, fair</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="card-grid-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="card card-hover" style={{ padding: 20, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span className="badge-icon">{s.icon}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>0{i + 1}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6 }}>{s.title}</div>
                  <p className="hint" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">CAPABILITIES</p>
              <h2 className="section-title">Infrastructure-grade features</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="card-grid-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 50}>
                <div className="card card-hover" style={{ padding: 22, height: '100%' }}>
                  <span className="badge-icon" style={{ marginBottom: 14 }}>{f.icon}</span>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6 }}>{f.title}</div>
                  <p className="hint" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
