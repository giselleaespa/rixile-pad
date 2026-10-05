import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Environment, RoundedBox } from '@react-three/drei'
import { Color, Group, MeshStandardMaterial, Vector3 } from 'three'

type SlabSpec = {
  id: number
  color: string
  size: [number, number, number]
  home: [number, number, number]
  rotation: [number, number, number]
  phase: number
}

const SLABS: SlabSpec[] = [
  { id: 0, color: '#1a1a1a', size: [2.88, 0.3, 1.05], home: [0.08, 1.52, 0], rotation: [0.02, -0.13, -0.035], phase: 0.3 },
  { id: 1, color: '#3a3a3a', size: [2.98, 0.31, 1.12], home: [-0.03, 0, 0.02], rotation: [-0.015, -0.04, 0.02], phase: 2.1 },
  { id: 2, color: '#d9d9d9', size: [3.12, 0.34, 1.2], home: [-0.02, -1.52, 0.04], rotation: [-0.025, 0.025, -0.02], phase: 4.2 },
]

type SlabProps = {
  spec: SlabSpec
  selectedId: number | null
  onSelect: (id: number | null) => void
  reducedMotion: boolean
}

function Slab({ spec, selectedId, onSelect, reducedMotion }: SlabProps) {
  const group = useRef<Group>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const velocity = useRef(new Vector3())
  const rotationVelocity = useRef(new Vector3())
  const dragOffset = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 })
  const pointerStart = useRef({ x: 0, y: 0 })
  const pointerLast = useRef({ x: 0, y: 0 })
  const wasSelectedAtPointerDown = useRef(false)
  const dragging = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const { gl } = useThree()
  useEffect(() => setSelected(selectedId === spec.id), [selectedId, spec.id])
  const otherSelected = selectedId !== null && !selected

  useFrame(({ clock }, frameDelta) => {
    if (!group.current) return
    const delta = Math.min(frameDelta, 0.04)
    const float = !reducedMotion && !dragging.current ? Math.sin(clock.elapsedTime * 0.65 + spec.phase) * 0.045 : 0
    const lift = hovered && !dragging.current ? 0.08 : 0
    const target = new Vector3(
      spec.home[0] + dragOffset.current.x,
      spec.home[1] + dragOffset.current.y + lift + float,
      spec.home[2] + (selected ? 0.27 : 0),
    )
    const targetRotation = new Vector3(
      spec.rotation[0] + dragOffset.current.rotX + (!reducedMotion && !dragging.current ? Math.sin(clock.elapsedTime * 0.42 + spec.phase) * 0.008 : 0),
      spec.rotation[1] + dragOffset.current.rotY,
      spec.rotation[2],
    )

    // Critically damped spring: drag impulses are followed smoothly, and release settles at home.
    const position = group.current.position
    const acceleration = target.sub(position).multiplyScalar(92).addScaledVector(velocity.current, -19)
    velocity.current.addScaledVector(acceleration, delta)
    position.addScaledVector(velocity.current, delta)

    const rotation = group.current.rotation
    const rotationError = targetRotation.sub(new Vector3(rotation.x, rotation.y, rotation.z))
    const rotationAcceleration = rotationError.multiplyScalar(88).addScaledVector(rotationVelocity.current, -18)
    rotationVelocity.current.addScaledVector(rotationAcceleration, delta)
    rotation.x += rotationVelocity.current.x * delta
    rotation.y += rotationVelocity.current.y * delta
    rotation.z += rotationVelocity.current.z * delta

    const scaleTarget = hovered || selected ? 1.02 : 1
    const scale = group.current.scale.x + (scaleTarget - group.current.scale.x) * Math.min(1, delta * 10)
    group.current.scale.setScalar(scale)

    if (material.current) {
      material.current.opacity += ((otherSelected ? 0.48 : 1) - material.current.opacity) * Math.min(1, delta * 7)
      material.current.emissiveIntensity += ((selected ? 0.25 : hovered ? 0.1 : 0) - material.current.emissiveIntensity) * Math.min(1, delta * 8)
    }
  })

  const pointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    event.nativeEvent.preventDefault()
    dragging.current = true
    setIsDragging(true)
    wasSelectedAtPointerDown.current = selected
    setSelected(true)
    onSelect(spec.id)
    pointerStart.current = { x: event.clientX, y: event.clientY }
    pointerLast.current = { x: event.clientX, y: event.clientY }
    gl.domElement.style.cursor = 'grabbing'
  }

  useEffect(() => {
    if (!isDragging) return
    const move = (event: PointerEvent) => {
      const deltaX = event.clientX - pointerLast.current.x
      const deltaY = event.clientY - pointerLast.current.y
      pointerLast.current = { x: event.clientX, y: event.clientY }
      dragOffset.current.x += deltaX * 0.0065
      dragOffset.current.y -= deltaY * 0.0065
      dragOffset.current.rotY += deltaX * 0.004
      dragOffset.current.rotX += deltaY * 0.004
    }
    const finish = (event: PointerEvent) => {
      if (!dragging.current) return
      const moved = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y)
      dragging.current = false
      setIsDragging(false)
      dragOffset.current.x = 0
      dragOffset.current.y = 0
      dragOffset.current.rotX = 0
      dragOffset.current.rotY = 0
      const nextSelected = !(moved < 5 && wasSelectedAtPointerDown.current)
      setSelected(nextSelected)
      onSelect(nextSelected ? spec.id : null)
      gl.domElement.style.cursor = hovered ? 'grab' : 'auto'
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
  }, [isDragging, gl, hovered, onSelect, spec.id])

  const reset = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    dragOffset.current.x = 0
    dragOffset.current.y = 0
    dragOffset.current.rotX = 0
    dragOffset.current.rotY = 0
    if (selected) onSelect(null)
  }

  return (
    <group ref={group} position={spec.home} rotation={spec.rotation}>
      <RoundedBox
        args={spec.size}
        radius={0.105}
        smoothness={5}
        castShadow
        receiveShadow
        onPointerDown={pointerDown}
        onPointerEnter={(event) => {
          event.stopPropagation()
          setHovered(true)
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerLeave={(event) => {
          event.stopPropagation()
          setHovered(false)
          if (!dragging.current) {
            gl.domElement.style.cursor = 'auto'
          }
        }}
        onDoubleClick={reset}
      >
        <meshStandardMaterial
          ref={material}
          color={spec.color}
          emissive={new Color('#89909e')}
          emissiveIntensity={0}
          roughness={0.34}
          metalness={0.18}
          transparent
          opacity={1}
        />
      </RoundedBox>
    </group>
  )
}

export default function Slabs() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <div className="h-full w-full touch-none" aria-label={selectedId === null ? 'Interactive floating slabs' : `Interactive floating slabs, slab ${selectedId + 1} selected`}>
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 8.2], fov: 34, near: 0.1, far: 50 }}
        className="h-full w-full touch-none"
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[-3.5, 6, 7]}
          intensity={3.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0003}
        />
        <pointLight position={[5, 0.5, 3]} intensity={0.8} color="#d6d9e0" />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>
        {SLABS.map((spec) => (
          <Slab key={spec.id} spec={spec} selectedId={selectedId} onSelect={setSelectedId} reducedMotion={reducedMotion} />
        ))}
      </Canvas>
    </div>
  )
}
