export interface TokenForm {
  name: string
  symbol: string
  description: string
  imageDataUrl: string
  imageUrl: string
  website: string
  twitter: string
  telegram: string
  discord: string
  totalSupply: string
  decimals: string
  initialSupply: string
  creatorPct: string
  liquidityPct: string
}

export const INITIAL_TOKEN_FORM: TokenForm = {
  name: '',
  symbol: '',
  description: '',
  imageDataUrl: '',
  imageUrl: '',
  website: '',
  twitter: '',
  telegram: '',
  discord: '',
  totalSupply: '1000000000',
  decimals: '9',
  initialSupply: '1000000000',
  creatorPct: '5',
  liquidityPct: '95',
}

export const MAX_IMAGE_BYTES = 1_000_000
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export function validateDetails(f: TokenForm): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = f.name.trim()
  if (!name) errors.name = 'Token name is required.'
  else if (name.length > 32) errors.name = 'Max 32 characters.'

  const symbol = f.symbol.trim().toUpperCase()
  if (!symbol) errors.symbol = 'Symbol is required.'
  else if (!/^[A-Z0-9]{1,10}$/.test(symbol)) errors.symbol = '1-10 letters or digits, no spaces.'

  if (f.description.length > 500) errors.description = 'Max 500 characters.'

  if (f.imageUrl.trim() && !/^https?:\/\/.+/.test(f.imageUrl.trim())) {
    errors.imageUrl = 'Enter a valid http(s) URL.'
  }
  if (f.website.trim() && !/^https?:\/\/.+/.test(f.website.trim())) errors.website = 'Enter a valid http(s) URL.'
  if (f.twitter.trim() && !/^https?:\/\/.+\..+/.test(f.twitter.trim())) errors.twitter = 'Enter a valid URL.'
  if (f.telegram.trim() && !/^https?:\/\/.+\..+/.test(f.telegram.trim())) errors.telegram = 'Enter a valid URL.'
  if (f.discord.trim() && !/^https?:\/\/.+\..+/.test(f.discord.trim())) errors.discord = 'Enter a valid URL.'
  return errors
}

export function validateTokenomics(f: TokenForm): Record<string, string> {
  const errors: Record<string, string> = {}
  const total = Number(f.totalSupply)
  const decimals = Number(f.decimals)
  const initial = Number(f.initialSupply)
  const creator = Number(f.creatorPct)
  const liquidity = Number(f.liquidityPct)

  if (!Number.isFinite(total) || total <= 0 || total > 1e15) {
    errors.totalSupply = 'Enter a total supply between 1 and 1,000,000,000,000,000.'
  }
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 9) {
    errors.decimals = 'Decimals must be an integer between 0 and 9.'
  }
  if (!errors.totalSupply && !errors.decimals && initial > total) {
    errors.initialSupply = 'Initial supply cannot exceed total supply.'
  }
  if (!Number.isFinite(initial) || initial <= 0) {
    errors.initialSupply = 'Initial supply must be greater than 0.'
  }
  if (!Number.isInteger(creator) || creator < 0 || creator > 100) {
    errors.creatorPct = 'Creator allocation must be 0-100%.'
  }
  if (!Number.isInteger(liquidity) || liquidity < 0 || liquidity > 100) {
    errors.liquidityPct = 'Liquidity allocation must be 0-100%.'
  }
  if (!errors.creatorPct && !errors.liquidityPct && creator + liquidity !== 100) {
    errors.liquidityPct = 'Creator + liquidity must equal 100%.'
  }
  return errors
}

export function isDetailsValid(f: TokenForm): boolean {
  return Object.keys(validateDetails(f)).length === 0
}

export function isTokenomicsValid(f: TokenForm): boolean {
  return Object.keys(validateTokenomics(f)).length === 0
}
