import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  INITIAL_TOKEN_FORM,
  isDetailsValid,
  isTokenomicsValid,
  validateDetails,
  validateTokenomics,
  type TokenForm,
} from './tokenForm'
import TokenDetailsForm from './TokenDetailsForm'
import TokenomicsForm from './TokenomicsForm'
import ReviewStep from './ReviewStep'
import DeployStep, { type DeployResult } from './DeployStep'
import SuccessScreen from './SuccessScreen'
import { ArrowRightIcon } from '../components/Icons'

const STEPS = [
  { id: 'details', num: '01', label: 'DETAILS' },
  { id: 'tokenomics', num: '02', label: 'TOKENOMICS' },
  { id: 'review', num: '03', label: 'REVIEW' },
  { id: 'deploy', num: '04', label: 'DEPLOY' },
] as const

type StepId = (typeof STEPS)[number]['id']

export default function LaunchWizard() {
  const [form, setForm] = useState<TokenForm>(INITIAL_TOKEN_FORM)
  const [step, setStep] = useState<StepId>('details')
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({})
  const [tokenomicsErrors, setTokenomicsErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<DeployResult | null>(null)

  const update = (patch: Partial<TokenForm>) => setForm((f) => ({ ...f, ...patch }))

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const detailsValid = useMemo(() => isDetailsValid(form), [form])
  const tokenomicsValid = useMemo(() => isTokenomicsValid(form), [form])

  const goToDetails = () => {
    const errors = validateDetails(form)
    setDetailsErrors(errors)
    if (Object.keys(errors).length === 0) setStep('tokenomics')
  }
  const goToReview = () => {
    const errors = validateTokenomics(form)
    setTokenomicsErrors(errors)
    if (Object.keys(errors).length === 0) setStep('review')
  }

  const canClickStep = (id: StepId): boolean => {
    if (result) return false
    const idx = STEPS.findIndex((s) => s.id === id)
    if (idx <= stepIndex) return true
    if (idx === 1) return detailsValid
    if (idx === 2) return detailsValid && tokenomicsValid
    return false
  }

  const restart = () => {
    setForm(INITIAL_TOKEN_FORM)
    setStep('details')
    setResult(null)
    setDetailsErrors({})
    setTokenomicsErrors({})
  }

  if (result) {
    return (
      <div className="container">
        <SuccessScreen result={result} form={form} onRestart={restart} />
      </div>
    )
  }

  return (
    <div className="container page-enter" style={{ padding: '40px 24px 80px' }}>
      {/* Stepper */}
      <nav aria-label="Launch steps" style={{ marginBottom: 36 }}>
        <ol
          style={{
            listStyle: 'none',
            display: 'flex',
            gap: 6,
            padding: 0,
            margin: 0,
            overflowX: 'auto',
          }}
        >
          {STEPS.map((s, i) => {
            const active = s.id === step
            const clickable = canClickStep(s.id)
            return (
              <li key={s.id} style={{ flex: 1, minWidth: 128 }}>
                <button
                  className="btn btn-sm"
                  disabled={result !== null && !clickable}
                  onClick={() => clickable && setStep(s.id)}
                  aria-current={active ? 'step' : undefined}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 10,
                    height: 44,
                    borderRadius: 'var(--radius)',
                    border: '1px solid ' + (active ? 'var(--border-strong)' : 'var(--border)'),
                    background: active ? 'var(--card)' : 'transparent',
                    boxShadow: active ? 'var(--shadow-card)' : 'none',
                    cursor: clickable ? 'pointer' : 'not-allowed',
                    opacity: clickable ? 1 : 0.5,
                    color: active ? 'var(--text)' : 'var(--text-2)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 10.5, color: active ? 'var(--text)' : 'var(--muted)' }}>
                    {s.num}
                  </span>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '0.1em' }}>{s.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {step === 'details' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Token details</h1>
            <p className="hint" style={{ marginTop: 6 }}>
              Name and symbol are written into the token metadata on Solana.
            </p>
          </div>
          <TokenDetailsForm form={form} update={update} errors={detailsErrors} setErrors={setDetailsErrors} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button className="btn btn-primary btn-lg" onClick={goToDetails}>
              Continue <ArrowRightIcon width={14} height={14} />
            </button>
          </div>
        </>
      )}

      {step === 'tokenomics' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Tokenomics</h1>
            <p className="hint" style={{ marginTop: 6 }}>
              Define supply and allocation. Values are validated live before you can continue.
            </p>
          </div>
          <TokenomicsForm form={form} update={update} errors={tokenomicsErrors} setErrors={setTokenomicsErrors} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={() => setStep('details')}>Back</button>
            <button className="btn btn-primary btn-lg" onClick={goToReview}>
              Continue <ArrowRightIcon width={14} height={14} />
            </button>
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>Review</h1>
            <p className="hint" style={{ marginTop: 6 }}>
              Verify everything. The next step asks your wallet to approve a real transaction.
            </p>
          </div>
          <ReviewStep form={form} imagePreview={form.imageDataUrl} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button className="btn btn-secondary" onClick={() => setStep('tokenomics')}>Back</button>
            <button className="btn btn-primary btn-lg" onClick={() => setStep('deploy')}>
              Create Token <ArrowRightIcon width={14} height={14} />
            </button>
          </div>
        </>
      )}

      {step === 'deploy' && (
        <DeployStep
          form={form}
          onSuccess={(r) => setResult(r)}
        />
      )}
    </div>
  )
}
