import type { TokenForm } from './tokenForm'
import { validateTokenomics } from './tokenForm'
import { formatNumber } from '../lib/format'

interface Props {
  form: TokenForm
  update: (patch: Partial<TokenForm>) => void
  errors: Record<string, string>
  setErrors: (e: Record<string, string>) => void
}

export default function TokenomicsForm({ form, update, errors, setErrors }: Props) {
  const set = (key: keyof TokenForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    update({ [key]: e.target.value } as Partial<TokenForm>)
    if (errors[key]) {
      const next = { ...errors }
      delete next[key]
      setErrors(next)
    }
  }

  const total = Number(form.totalSupply) || 0
  const initial = Number(form.initialSupply) || 0
  const creatorPct = Number(form.creatorPct) || 0
  const liquidityPct = Number(form.liquidityPct) || 0
  const creatorAmount = Math.round(initial * (creatorPct / 100))
  const liquidityAmount = Math.round(initial * (liquidityPct / 100))
  const valid = Object.keys(validateTokenomics(form)).length === 0
  const decimals = Number(form.decimals) || 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 28 }} className="details-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="field">
          <label className="label" htmlFor="tok-supply">Total Supply</label>
          <input
            id="tok-supply"
            className={`input mono ${errors.totalSupply ? 'input-invalid' : ''}`}
            inputMode="numeric"
            placeholder="1000000000"
            value={form.totalSupply}
            onChange={(e) => {
              update({ totalSupply: e.target.value.replace(/[^0-9]/g, '') })
              if (errors.totalSupply) {
                const next = { ...errors }
                delete next.totalSupply
                setErrors(next)
              }
            }}
          />
          {errors.totalSupply ? <span className="error-text">{errors.totalSupply}</span> : <span className="hint">{formatNumber(total)} units</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="label" htmlFor="tok-decimals">Decimals</label>
            <select
              id="tok-decimals"
              className="select"
              value={form.decimals}
              onChange={set('decimals')}
            >
              {[0, 2, 5, 6, 8, 9].map((d) => (
                <option key={d} value={d}>{d} decimals</option>
              ))}
            </select>
            {errors.decimals && <span className="error-text">{errors.decimals}</span>}
          </div>
          <div className="field">
            <label className="label" htmlFor="tok-initial">Initial Supply</label>
            <input
              id="tok-initial"
              className={`input mono ${errors.initialSupply ? 'input-invalid' : ''}`}
              inputMode="numeric"
              value={form.initialSupply}
              onChange={(e) => {
                update({ initialSupply: e.target.value.replace(/[^0-9]/g, '') })
                if (errors.initialSupply) {
                  const next = { ...errors }
                  delete next.initialSupply
                  setErrors(next)
                }
              }}
            />
            {errors.initialSupply && <span className="error-text">{errors.initialSupply}</span>}
          </div>
        </div>

        <hr className="divider" style={{ margin: '6px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="label" htmlFor="tok-creator">Creator Allocation %</label>
            <input
              id="tok-creator"
              className={`input mono ${errors.creatorPct ? 'input-invalid' : ''}`}
              inputMode="numeric"
              value={form.creatorPct}
              onChange={(e) => {
                update({ creatorPct: e.target.value.replace(/[^0-9]/g, '') })
                if (errors.creatorPct) {
                  const next = { ...errors }
                  delete next.creatorPct
                  setErrors(next)
                }
              }}
            />
            {errors.creatorPct && <span className="error-text">{errors.creatorPct}</span>}
          </div>
          <div className="field">
            <label className="label" htmlFor="tok-liq">Liquidity Allocation %</label>
            <input
              id="tok-liq"
              className={`input mono ${errors.liquidityPct ? 'input-invalid' : ''}`}
              inputMode="numeric"
              value={form.liquidityPct}
              onChange={(e) => {
                update({ liquidityPct: e.target.value.replace(/[^0-9]/g, '') })
                if (errors.liquidityPct) {
                  const next = { ...errors }
                  delete next.liquidityPct
                  setErrors(next)
                }
              }}
            />
            {errors.liquidityPct && <span className="error-text">{errors.liquidityPct}</span>}
          </div>
        </div>
      </div>

      {/* Live allocation panel */}
      <aside>
        <div className="card" style={{ padding: 22, position: 'sticky', top: 86 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>ALLOCATION</div>
          <div style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.02em', marginBottom: 4 }} className="mono">
            {formatNumber(total)}
          </div>
          <div className="hint" style={{ marginBottom: 18 }}>TOTAL SUPPLY</div>

          <div
            style={{
              display: 'flex',
              height: 12,
              borderRadius: 999,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              opacity: valid ? 1 : 0.4,
            }}
            role="img"
            aria-label={`Creator ${creatorPct}%, liquidity ${liquidityPct}%`}
          >
            <div style={{ width: `${creatorPct}%`, background: '#18181B' }} />
            <div style={{ width: `${liquidityPct}%`, background: '#A3A3AB' }} />
          </div>

          <div className="kv" style={{ marginTop: 16 }}>
            <span className="k"><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#18181B', marginRight: 8 }} />Creator</span>
            <span className="v mono">{creatorPct}% · {formatNumber(creatorAmount)}</span>
          </div>
          <div className="kv">
            <span className="k"><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#A3A3AB', marginRight: 8 }} />Liquidity</span>
            <span className="v mono">{liquidityPct}% · {formatNumber(liquidityAmount)}</span>
          </div>
          <div className="kv">
            <span className="k">Precision</span>
            <span className="v mono">{decimals} decimals</span>
          </div>

          <p className="hint" style={{ marginTop: 14, lineHeight: 1.5 }}>
            The full initial supply is minted to your wallet in the creation transaction. Liquidity
            allocation is reserved for the future pool deposit.
          </p>
        </div>
      </aside>
    </div>
  )
}
