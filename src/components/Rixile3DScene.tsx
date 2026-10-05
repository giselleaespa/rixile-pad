import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'

const PLATES = [
  { color: '#18181B', y: 1.06, x: 0.14, z: 0.1 },
  { color: '#56565E', y: 0, x: -0.02, z: 0 },
  { color: '#A3A3AB', y: -1.06, x: -0.18, z: -0.1 },
]

function Bars({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null)

  useFrame(({ clock, pointer }, delta) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    if (reducedMotion) {
      g.rotation.y = 0.5
      g.rotation.x = 0.12
      return
    }
    const targetY = 0.5 + pointer.x * 0.35
    const targetX = 0.12 - pointer.y * 0.18
    const damp = 1 - Math.exp(-3 * delta)
    g.rotation.y += (targetY - g.rotation.y) * damp
    g.rotation.x += (targetX - g.rotation.x) * damp
    g.position.y = Math.sin(t * 0.5) * 0.12
  })

  return (
    <group ref={group} rotation={[0.12, 0.5, 0]}>
      {PLATES.map((p, i) => (
        <Plate key={i} {...p} reducedMotion={reducedMotion} phase={i * 1.7} />
      ))}
    </group>
  )
}

function Plate({
  color,
  y,
  x,
  z,
  reducedMotion,
  phase,
}: {
  color: string
  y: number
  x: number
  z: number
  reducedMotion: boolean
  phase: number
}) {
  const mesh = useRef<Group>(null)

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m || reducedMotion) return
    m.position.y = y + Math.sin(clock.elapsedTime * 0.7 + phase) * 0.05
  })

  return (
    <group ref={mesh} position={[x, y, z]}>
      <RoundedBox args={[3.1, 0.42, 1.5]} radius={0.07} smoothness={4} rotation={[0, 0, -0.1]}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.32}
          metalness={0.25}
          clearcoat={0.5}
          clearcoatRoughness={0.35}
        />
      </RoundedBox>
    </group>
  )
}

export default function Rixile3DScene({
  size,
  reducedMotion,
  onError,
}: {
  size: number
  reducedMotion: boolean
  onError: () => void
}) {
  const isSmall = size < 320

  useEffect(() => {
    // Safety: if WebGL context creation throws, fall back silently.
    const id = setTimeout(() => {
      /* noop */
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <Canvas
      dpr={isSmall ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0.3, 6.4], fov: 34 }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            onError()
          },
          false,
        )
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} />
      <directionalLight position={[-5, -2, -3]} intensity={0.3} />
      <Bars reducedMotion={reducedMotion} />
      {!reducedMotion && (
        <ContactShadows
          position={[0, -2.35, 0]}
          opacity={0.16}
          scale={9}
          blur={3}
          far={3}
          color="#000000"
        />
      )}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer intensity={1.1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer intensity={1.1} position={[5, -1, 0]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer intensity={0.6} position={[0, 0, 5]} scale={[6, 6, 1]} />
      </Environment>
    </Canvas>
  )
}
