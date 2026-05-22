import { Suspense, Component } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Center, Environment } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Box } from 'lucide-react'
import { Spinner } from '../ui/Spinner'

function Model({ url }) {
  const geometry = useLoader(STLLoader, url)

  return (
    <Center>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#C0622A" roughness={0.5} metalness={0.1} />
      </mesh>
    </Center>
  )
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-warm-100 rounded-xl">
      <Spinner />
    </div>
  )
}

function ErrorFallback({ height }) {
  return (
    <div className="rounded-2xl bg-warm-100 border border-warm-300 flex flex-col items-center justify-center gap-2" style={{ height }}>
      <Box size={48} className="text-warm-300" />
      <p className="text-sm text-warm-500">Modelo 3D no disponible</p>
    </div>
  )
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export function ModelViewer({ stlUrl, height = 520 }) {
  return (
    <ModelErrorBoundary fallback={<ErrorFallback height={height} />}>
      <div className="relative rounded-2xl overflow-hidden bg-warm-100 border border-warm-300" style={{ height }}>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            frameloop="demand"
            camera={{ position: [0, 0, 80], fov: 45 }}
            gl={{ powerPreference: 'low-power', antialias: false, failIfMajorPerformanceCaveat: false }}
            onContextLost={e => e.preventDefault()}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <directionalLight position={[-5, -5, -5]} intensity={0.3} />
            <Model url={stlUrl} />
            <OrbitControls enablePan={false} minDistance={20} maxDistance={600} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
        <p className="absolute bottom-2 right-2 text-xs text-warm-400">
          Arrastra para rotar · Scroll para zoom
        </p>
      </div>
    </ModelErrorBoundary>
  )
}
