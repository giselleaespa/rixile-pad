import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'

const Slabs = lazy(() => import('./Slabs'))

export default function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-[#0a0a0a] text-white selection:bg-white/20 selection:text-white">
      <div className="mx-auto grid min-h-svh max-w-[1440px] grid-cols-1 items-center lg:grid-cols-[55%_45%]">
        <div className="relative z-10 flex flex-col justify-center px-7 pb-4 pt-12 sm:px-12 lg:px-16 lg:py-20 xl:px-24">
          <p className="mb-7 flex items-center gap-3 font-mono text-[10px] font-medium tracking-[0.24em] text-white/45 sm:text-[11px]">
            <span aria-hidden="true" className="h-px w-6 bg-white/40" />
            SOLANA TOKEN LAUNCHPAD
          </p>

          <h1 className="!m-0 max-w-[720px] !text-[clamp(3rem,5.15vw,4.65rem)] !font-bold !leading-[0.99] !tracking-[-0.06em] text-white">
            Launch tokens on Solana.
          </h1>
          <h2 className="mt-2 max-w-[700px] !text-[clamp(1.85rem,3.5vw,3.1rem)] !font-semibold !leading-[1.08] !tracking-[-0.05em] text-white/45">
            Built for fair launches.
          </h2>

          <p className="mt-7 max-w-[450px] text-[15px] leading-7 text-white/55 sm:text-base sm:leading-7">
            Create, launch and discover tokens with transparent on-chain mechanics.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/launch"
              className="inline-flex h-12 items-center gap-3 rounded-md bg-white px-5 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Launch a token <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex h-12 items-center rounded-md border border-white/15 bg-white/[0.035] px-5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore launches
            </Link>
          </div>

          <p className="mt-10 font-mono text-[9px] font-medium tracking-[0.19em] text-white/35 sm:mt-12 sm:text-[10px] sm:tracking-[0.22em]">
            NON-CUSTODIAL <span className="px-1.5 text-white/20">/</span> ON-CHAIN <span className="px-1.5 text-white/20">/</span> TRANSPARENT
          </p>
        </div>

        <div className="relative order-last h-[43svh] min-h-[300px] max-h-[480px] lg:h-svh lg:min-h-[620px] lg:max-h-none">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_55%_70%,rgba(160,160,180,0.1),transparent_28%),radial-gradient(ellipse_at_55%_50%,rgba(160,160,180,0.08),transparent_28%),radial-gradient(ellipse_at_55%_30%,rgba(160,160,180,0.06),transparent_26%)]" />
          <Suspense fallback={null}><Slabs /></Suspense>
        </div>
      </div>
    </section>
  )
}
