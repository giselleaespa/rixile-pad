import { Suspense, lazy, useEffect, useRef, useState } from 'react'

const Rixile3DScene = lazy(() => import('./Rixile3DScene'))

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Signature 3D RIXILE visual. The heavy WebGL bundle is loaded lazily and only
 * when the placeholder scrolls near the viewport. Reduced-motion users get a
 * static render (single demand-frame).
 */
export default function Rixile3D({
  size = 420,
  className,
}: {
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [reduced] = useState(prefersReducedMotion)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
      aria-hidden="true"
    >
      {near && !failed ? (
        <Suspense fallback={null}>
          <Rixile3DScene
            size={size}
            reducedMotion={reduced}
            onError={() => setFailed(true)}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
