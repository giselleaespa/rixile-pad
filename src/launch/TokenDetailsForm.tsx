import { useRef, useState } from 'react'
import type { TokenForm } from './tokenForm'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, validateDetails } from './tokenForm'
import { UploadIcon, XIcon, AlertIcon } from '../components/Icons'
import { TokenAvatar } from '../components/LaunchCard'

interface Props {
  form: TokenForm
  update: (patch: Partial<TokenForm>) => void
  errors: Record<string, string>
  setErrors: (e: Record<string, string>) => void
}

export default function TokenDetailsForm({ form, update, errors, setErrors }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState('')

  const onFile = (file: File | undefined) => {
    setImageError('')
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Unsupported format. Use PNG, JPG, WebP or SVG.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Maximum size is 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update({ imageDataUrl: String(reader.result) })
    reader.onerror = () => setImageError('Could not read the file.')
    reader.readAsDataURL(file)
  }

  const set = (key: keyof TokenForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    update({ [key]: e.target.value } as Partial<TokenForm>)
    if (errors[key]) {
      const next = { ...errors }
      delete next[key]
      setErrors(next)
    }
  }

  const previewSymbol = form.symbol.trim().toUpperCase() || 'XXX'
  const previewName = form.name.trim() || 'Token Name'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 28 }} className="details-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="field">
          <label className="label" htmlFor="tok-name">Token Name</label>
          <input
            id="tok-name"
            className={`input ${errors.name ? 'input-invalid' : ''}`}
            placeholder="Rixile Token"
            value={form.name}
            onChange={set('name')}
            maxLength={40}
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="tok-symbol">Token Symbol</label>
          <div className="input-affix">
            <input
              id="tok-symbol"
              className={`input ${errors.symbol ? 'input-invalid' : ''}`}
              placeholder="RXL"
              value={form.symbol}
              onChange={(e) => {
                update({ symbol: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })
                if (errors.symbol) {
                  const next = { ...errors }
                  delete next.symbol
                  setErrors(next)
                }
              }}
              maxLength={10}
              aria-invalid={!!errors.symbol}
            />
            <span className="affix">$</span>
          </div>
          {errors.symbol && <span className="error-text">{errors.symbol}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="tok-desc">
            Description <span className="optional">{form.description.length}/500</span>
          </label>
          <textarea
            id="tok-desc"
            className={`textarea ${errors.description ? 'input-invalid' : ''}`}
            placeholder="What does your token do?"
            value={form.description}
            onChange={set('description')}
            maxLength={520}
            aria-invalid={!!errors.description}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="tok-image">
            Token Image <span className="optional">PNG · JPG · WebP · SVG — max 1 MB</span>
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {form.imageDataUrl ? (
              <div style={{ position: 'relative', flex: 'none' }}>
                <img
                  src={form.imageDataUrl}
                  alt="Token preview"
                  style={{ width: 64, height: 64, borderRadius: 9, border: '1px solid var(--border)', objectFit: 'cover' }}
                />
                <button
                  className="icon-btn"
                  style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24 }}
                  aria-label="Remove image"
                  onClick={() => update({ imageDataUrl: '' })}
                >
                  <XIcon width={11} height={11} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ height: 64, width: '100%', flexDirection: 'column', gap: 4, borderStyle: 'dashed' }}
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                <UploadIcon />
                <span style={{ fontSize: 12.5 }}>Upload image</span>
              </button>
            )}
            {form.imageDataUrl && (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()}>
                Replace
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
              aria-label="Token image file"
            />
          </div>
          {imageError && (
            <span className="error-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <AlertIcon width={12} height={12} /> {imageError}
            </span>
          )}
        </div>

        <div className="field">
          <label className="label" htmlFor="tok-imageurl">
            Image URL <span className="optional">stored on-chain if hosted</span>
          </label>
          <input
            id="tok-imageurl"
            className={`input ${errors.imageUrl ? 'input-invalid' : ''}`}
            placeholder="https://example.com/logo.png"
            value={form.imageUrl}
            onChange={set('imageUrl')}
            aria-invalid={!!errors.imageUrl}
          />
          {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
          <span className="hint">Uploaded files are used for preview only. To write the image into on-chain metadata, paste a hosted image URL.</span>
        </div>

        <hr className="divider" style={{ margin: '6px 0' }} />

        <div className="field">
          <label className="label" htmlFor="tok-website">Website <span className="optional">optional</span></label>
          <input id="tok-website" className={`input ${errors.website ? 'input-invalid' : ''}`} placeholder="https://" value={form.website} onChange={set('website')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="social-grid">
          <div className="field">
            <label className="label" htmlFor="tok-x">X / Twitter <span className="optional">optional</span></label>
            <input id="tok-x" className={`input ${errors.twitter ? 'input-invalid' : ''}`} placeholder="https://x.com/" value={form.twitter} onChange={set('twitter')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="tok-tg">Telegram <span className="optional">optional</span></label>
            <input id="tok-tg" className={`input ${errors.telegram ? 'input-invalid' : ''}`} placeholder="https://t.me/" value={form.telegram} onChange={set('telegram')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="tok-dc">Discord <span className="optional">optional</span></label>
            <input id="tok-dc" className={`input ${errors.discord ? 'input-invalid' : ''}`} placeholder="https://discord.gg/" value={form.discord} onChange={set('discord')} />
          </div>
        </div>
      </div>

      {/* Live token preview */}
      <aside>
        <div className="card" style={{ padding: 22, position: 'sticky', top: 86 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>LIVE PREVIEW</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
            {form.imageDataUrl ? (
              <img
                src={form.imageDataUrl}
                alt=""
                style={{ width: 72, height: 72, borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }}
              />
            ) : (
              <TokenAvatar symbol={previewSymbol} accent="var(--primary)" size={72} />
            )}
            <div>
              <div style={{ fontWeight: 650, fontSize: 16 }}>{previewName}</div>
              <div className="mono" style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                ${previewSymbol}
              </div>
            </div>
            {form.description.trim() && (
              <p className="hint" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{form.description}</p>
            )}
            {form.website.trim() && (
              <span className="chip" style={{ maxWidth: '100%', overflow: 'hidden' }}>{form.website.replace(/^https?:\/\//, '').slice(0, 28)}</span>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
