import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Html, Float, Sparkles, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Grid3X3,
  Layers,
  Zap,
  RefreshCw,
  MousePointer
} from 'lucide-react';
import * as THREE from 'three';

interface ProductViewer3DProps {
  productImages: string[];
  productName: string;
  selectedColor?: string;
  onImageChange?: (index: number) => void;
}

// Enhanced 3D Product Model Component
function Product3DModel({ 
  image, 
  rotation, 
  scale, 
  autoRotate, 
  hovering 
}: { 
  image: string; 
  rotation: [number, number, number]; 
  scale: number;
  autoRotate: boolean;
  hovering: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(image, (loadedTexture) => {
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      setTexture(loadedTexture);
    });
  }, [image]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (autoRotate) {
        meshRef.current.rotation.y += delta * 0.5;
      }
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Breathing scale effect when hovering
      if (hovering) {
        const breathe = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
        meshRef.current.scale.setScalar(scale * breathe);
      } else {
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.3}
    >
      <mesh
        ref={meshRef}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 2.5, 0.1]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.1}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
        
        {/* Glowing edges */}
        <mesh scale={[1.02, 1.02, 1.02]}>
          <boxGeometry args={[2, 2.5, 0.1]} />
          <meshBasicMaterial
            color="#8B5CF6"
            transparent
            opacity={hovering ? 0.3 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>
    </Float>
  );
}

// Particle System for magical effects
function ParticleSystem({ count = 100 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  });

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.001;
      points.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8B5CF6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Enhanced Camera Controller
function CameraController({ autoRotate, position }: { autoRotate: boolean; position: [number, number, number] }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    if (autoRotate) {
      const time = state.clock.elapsedTime;
      camera.position.x = Math.sin(time * 0.3) * 5;
      camera.position.z = Math.cos(time * 0.3) * 5;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// Main ProductViewer3D Component
const ProductViewer3D: React.FC<ProductViewer3DProps> = ({ 
  productImages, 
  productName, 
  selectedColor = '',
  onImageChange 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'vr'>('3d');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>();

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    onImageChange?.(index);
    
    // Add transition animation
    setRotation([Math.random() * 0.2 - 0.1, Math.random() * Math.PI * 2, 0]);
  };

  const resetView = () => {
    setRotation([0, 0, 0]);
    setZoom(1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentImage = productImages[currentImageIndex] || '/placeholder.svg';

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden`}>
      {/* Enhanced Control Panel */}
      <motion.div 
        className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-gray-200"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Auto Rotate */}
          <motion.button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-3 rounded-xl transition-all ${autoRotate ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Auto Rotate"
          >
            <RefreshCw className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-xl transition-all ${isPlaying ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>

          {/* Grid Toggle */}
          <motion.button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-3 rounded-xl transition-all ${showGrid ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-5 h-5" />
          </motion.button>

          {/* Environment Toggle */}
          <motion.button
            onClick={() => setShowEnvironment(!showEnvironment)}
            className={`p-3 rounded-xl transition-all ${showEnvironment ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle Environment"
          >
            <Layers className="w-5 h-5" />
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl transition-all ${soundEnabled ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </motion.button>

          {/* Reset View */}
          <motion.button
            onClick={resetView}
            className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* AR Button */}
          <motion.button
            onClick={() => setViewMode(viewMode === 'ar' ? '3d' : 'ar')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'ar' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="AR Mode"
          >
            <Camera className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Animation Speed Control */}
      <motion.div 
        className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Animation Speed</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          className="w-24 accent-primary"
        />
        <div className="text-xs text-gray-500 mt-1">{animationSpeed.toFixed(1)}x</div>
      </motion.div>

      {/* View Mode Indicator */}
      <motion.div 
        className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl border border-gray-200"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider">{viewMode} Mode</span>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div 
        className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <MousePointer className="w-4 h-4" />
          <span>Drag to rotate • Scroll to zoom • Right-click to pan</span>
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className="w-full h-full"
      >
        <Suspense fallback={
          <Html center>
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span className="font-medium">Loading 3D Experience...</span>
            </div>
          </Html>
        }>
          {/* Lighting Setup */}
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Environment */}
          {showEnvironment && (
            <Environment
              preset="studio"
              background={false}
              blur={0.8}
            />
          )}

          {/* Grid Helper */}
          {showGrid && (
            <gridHelper args={[20, 20, 0x888888, 0x444444]} />
          )}

          {/* Particle Effects */}
          <ParticleSystem count={50} />

          {/* Sparkles */}
          <Sparkles
            count={30}
            scale={[10, 10, 10]}
            size={6}
            speed={0.4}
            opacity={0.6}
            color="#8B5CF6"
          />

          {/* Main Product Model */}
          <Product3DModel
            image={currentImage}
            rotation={rotation}
            scale={zoom}
            autoRotate={autoRotate && isPlaying}
            hovering={hovering}
          />

          {/* Contact Shadows */}
          <ContactShadows
            opacity={0.4}
            scale={10}
            blur={1}
            far={10}
            resolution={256}
            color="#000000"
          />

          {/* Camera Controller */}
          <CameraController 
            autoRotate={autoRotate && isPlaying} 
            position={[0, 0, 5]} 
          />

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI}
            minDistance={2}
            maxDistance={10}
            autoRotate={autoRotate && isPlaying}
            autoRotateSpeed={2 * animationSpeed}
          />
        </Suspense>
      </Canvas>

      {/* Image Navigation */}
      {productImages.length > 1 && (
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-gray-200"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex gap-2">
            {productImages.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                  currentImageIndex === index 
                    ? 'border-primary scale-110 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: currentImageIndex === index ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={image}
                  alt={`${productName} - View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="text-center">
                <Pause className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">3D Experience Paused</p>
                <p className="text-sm text-gray-500">Click play to resume</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Mode Overlay */}
      <AnimatePresence>
        {viewMode === 'ar' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <Camera className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">AR Experience</h3>
              <p className="text-gray-600 mb-6">
                Experience {productName} in your space using augmented reality
              </p>
              <div className="space-y-3">
                <button className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
                  Launch AR View
                </button>
                <button 
                  onClick={() => setViewMode('3d')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:border-gray-400 transition-colors"
                >
                  Back to 3D
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductViewer3D; 