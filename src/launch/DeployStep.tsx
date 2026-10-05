import { useCallback, useEffect, useRef, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import type { TokenForm } from './tokenForm'
import {
  prepareTokenDeployment,
  confirmSignature,
  type PreparedDeployment,
} from '../lib/solana/tokenDeploy'
import { mapTxError, type MappedTxError } from '../lib/solana/errors'
import { formatLamportsSol, shortenAddress } from '../lib/format'
import Rixile3D from '../components/Rixile3D'
import { AlertIcon, CheckIcon } from '../components/Icons'
import { solscanUrl } from '../lib/config'

export interface DeployResult {
  mintAddress: string
  signature: string
  solscanToken: string
  solscanTx: string
}

type Stage = 'preparing' | 'awaiting-approval' | 'creating' | 'confirming' | 'confirmed'

const STAGES: { id: Stage; label: string }[] = [
  { id: 'preparing', label: 'Preparing transaction' },
  { id: 'awaiting-approval', label: 'Waiting for wallet approval' },
  { id: 'creating', label: 'Creating token' },
  { id: 'confirming', label: 'Confirming on Solana' },
]

function stageState(stage: Stage, id: Stage): 'done' | 'active' | 'pending' {
  const order = STAGES.findIndex((s) => s.id === stage)
  const me = STAGES.findIndex((s) => s.id === id)
  if (me < order) return 'done'
  if (me === order) return 'active'
  return 'pending'
}

interface Props {
  form: TokenForm
  onSuccess: (result: DeployResult) => void
}

export default function DeployStep({ form, onSuccess }: Props) {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const [stage, setStage] = useState<Stage>('preparing')
  const [error, setError] = useState<MappedTxError | null>(null)
  const [fee, setFee] = useState<number | null>(null)
  const running = useRef(false)

  const run = useCallback(async () => {
    if (running.current) return
    running.current = true
    setError(null)

    try {
      if (!connected || !publicKey || !sendTransaction) {
        setStage('preparing')
        setError({ kind: 'not-connected', title: 'Wallet not connected', message: 'Connect a Solana wallet to deploy your token.' })
        running.current = false
        return
      }

      setStage('preparing')
      const prepared: PreparedDeployment = await prepareTokenDeployment(publicKey, {
        name: form.name,
        symbol: form.symbol.toUpperCase(),
        uri: form.imageUrl.trim(),
        decimals: Number(form.decimals),
        initialSupply: Number(form.initialSupply),
        creatorAllocationPct: Number(form.creatorPct),
        liquidityAllocationPct: Number(form.liquidityPct),
      })
      setFee(prepared.estimatedLamports)

      setStage('awaiting-approval')
      // Real wallet approval — the wallet UI opens and the user must explicitly approve.
      const signature = await sendTransaction(prepared.transaction, connection, {
        signers: [prepared.mint],
      })

      setStage('creating')

      setStage('confirming')
      const { blockhash, lastValidBlockHeight } = prepared
      const result = await confirmSignature(signature, blockhash, lastValidBlockHeight)

      if (!result.confirmed) {
        setError({
          kind: 'timeout',
          title: 'Not confirmed',
          message: `The transaction ${shortenAddress(signature, 6)} did not reach confirmation in time. Check it on Solscan — if it landed, your token exists.`,
        })
        running.current = false
        return
      }

      setStage('confirmed')
      onSuccess({
        mintAddress: prepared.mintAddress,
        signature,
        solscanToken: solscanUrl('token', prepared.mintAddress),
        solscanTx: solscanUrl('tx', signature),
      })
    } catch (e) {
      const mapped = mapTxError(e)
      setError(mapped)
    } finally {
      running.current = false
    }
  }, [connected, publicKey, sendTransaction, connection, form, onSuccess])

  // Kick off once on mount (entry point from Review).
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    run()
  }, [run])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 32, alignItems: 'start' }} className="details-grid">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, padding: '12px 0' }}>
        <div aria-hidden="true">
          <Rixile3D size={260} />
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>DEPLOYING</div>
          <h3 style={{ fontSize: 20, letterSpacing: '-0.02em' }}>Creating your token</h3>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 340 }} role="status" aria-live="polite">
          {STAGES.map((s) => {
            const state = stageState(stage, s.id)
            return (
              <li
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  justifyContent: 'flex-start',
                  fontSize: 13.5,
                  color: state === 'pending' ? 'var(--muted)' : 'var(--text)',
                  opacity: state === 'pending' ? 0.55 : 1,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    flex: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: state === 'pending' ? '1px solid var(--border-strong)' : 'none',
                    background: state === 'done' ? 'var(--success)' : 'transparent',
                    color: state === 'done' ? '#fff' : 'var(--text-2)',
                    fontSize: 10,
                  }}
                  aria-hidden="true"
                >
                  {state === 'done' ? <CheckIcon width={10} height={10} strokeWidth={3} /> : state === 'active' ? <span className="btn-spinner" style={{ width: 10, height: 10 }} /> : ''}
                </span>
                {s.label}
              </li>
            )
          })}
        </ol>

        {fee !== null && stage !== 'confirmed' && (
          <p className="hint mono" style={{ fontSize: 11.5 }}>
            Rent + fee (estimate): {formatLamportsSol(fee, 5)}
          </p>
        )}
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div className="card" style={{ padding: 20, borderColor: 'var(--border)' }} role="alert">
            <div className="banner banner-danger" style={{ padding: 0, background: 'none', border: 'none' }}>
              <AlertIcon width={16} height={16} />
              <div>
                <div className="banner-title">{error.title}</div>
                <div className="banner-body">{error.message}</div>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 16 }}
              onClick={() => {
                started.current = false
                setError(null)
                setStage('preparing')
                run()
              }}
            >
              Try again
            </button>
          </div>
        )}

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>WHAT GETS EXECUTED</div>
          <ul className="hint" style={{ margin: 0, paddingLeft: 16, lineHeight: 1.7, fontSize: 12.5 }}>
            <li>Create mint account (Token-2022)</li>
            <li>Write name &amp; symbol metadata on-chain</li>
            <li>Create your associated token account</li>
            <li>Mint {form.initialSupply ? Number(form.initialSupply).toLocaleString('en-US') : '—'} units to your wallet</li>
          </ul>
        </div>

        <div className="banner banner-info" style={{ fontSize: 12.5 }}>
          <div>
            Nothing is signed automatically. Your wallet must approve every transaction, and the
            status above only advances on real network state.
          </div>
        </div>
      </aside>
    </div>
  )
}
