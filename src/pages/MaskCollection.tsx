import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WatermarkLogo, InlineLogo } from '@/components/VlancoLogo';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  ShoppingCart, 
  Heart, 
  Users, 
  Package, 
  TrendingUp,
  Check,
  ArrowRight,
  Crown,
  Sparkles,
  Shield,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Eye,
  Zap,
  Flame,
  Target,
  Award
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/AuthModal';
import AnimatedCartButton from '@/components/AnimatedCartButton';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnimatedSpaceBackground from '@/components/AnimatedSpaceBackground';

// Import photos from assets
import heroBgImage from '@/assets/hero-bg.jpg';
import photo1Image from '@/assets/photo1.jpg';
import product1Image from '@/assets/product-1.jpg';
import product2Image from '@/assets/product-2.jpg';
import product3Image from '@/assets/product-3.jpg';
import product4Image from '@/assets/product-4.jpg';

// Import mask media files
import s9775MaskImage1 from '@/assets/mask_photos/Screenshot 2025-09-01 181745.png';
import s9775MaskImage2 from '@/assets/mask_photos/H6cee3d9b0fa6474cb47f0ad8c979cb23s.avif';
import s9775MaskImage3 from '@/assets/mask_photos/Hb0fc3f9595074f3ebb8bbbbbcd0b8a83R.avif';
import s9775MaskVideo from '@/assets/mask_photos/Screen Recording 2025-09-01 184718.mp4';

// Import mask 2 media files
import mask2Image1 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190050.png';
import mask2Image2 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190058.png';
import mask2Image3 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190107.png';
import mask2Image4 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190113.png';
import mask2Image5 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190120.png';
import mask2Image6 from '@/assets/mask_photos/mask_photos_2/Screenshot 2025-09-01 190147.png';

// Import mask 3 media files
import mask3Image1 from '@/assets/mask_photos_3/Screenshot 2025-09-01 192717.png';
import mask3Image2 from '@/assets/mask_photos_3/Screenshot 2025-09-01 192736.png';
import mask3Image3 from '@/assets/mask_photos_3/Screenshot 2025-09-01 192745.png';
import mask3Image4 from '@/assets/mask_photos_3/Screenshot 2025-09-01 192752.png';
import mask3Image5 from '@/assets/mask_photos_3/Screenshot 2025-09-01 192759.png';
import mask3Image6 from '@/assets/mask_photos_3/Screenshot 2025-09-01 193012.png';

// Import mask 4 media files
import mask4Image1 from '@/assets/mask_photos4/Screenshot 2025-09-02 013315.png';
import mask4Image2 from '@/assets/mask_photos4/Screenshot 2025-09-02 013326.png';
import mask4Image3 from '@/assets/mask_photos4/Screenshot 2025-09-02 013449.png';
import mask4Image4 from '@/assets/mask_photos4/Screenshot 2025-09-02 013524.png';
import mask4Image5 from '@/assets/mask_photos4/Screenshot 2025-09-02 013530.png';
import mask4Image6 from '@/assets/mask_photos4/Screenshot 2025-09-02 013614.png';

// Import mask 5 media files
import mask5Image1 from '@/assets/mask_photos5/Screenshot 2025-09-02 134038.png';
import mask5Image2 from '@/assets/mask_photos5/Screenshot 2025-09-02 134045.png';

// 3D Floating Mask Component - Optimized
const FloatingMask = ({ position, rotation, scale, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Optimized animation with reduced frequency and smoother movement
  useFrame((state) => {
    if (meshRef.current && state.clock.elapsedTime % 0.016 < 0.008) {
      meshRef.current.rotation.y += 0.005; // Reduced rotation speed
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.0005; // Slower oscillation
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.8} 
        roughness={0.2}
        depthWrite={true}
        transparent={false}
      />
    </mesh>
  );
};

// 3D Animated Particles Component - Optimized
const AnimatedParticles = ({ count = 100 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (meshRef.current && state.clock.elapsedTime % 0.016 < 0.008) { // 60fps optimization
      meshRef.current.rotation.y += 0.0005; // Reduced rotation speed
      meshRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={meshRef}>
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
        color="#00ffff" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

// 3D Mask Scene Component with Enhanced Background - Optimized
const MaskScene = ({ performanceMode = false }) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 75 }}
      gl={{ 
        antialias: false, // Disable antialiasing for performance
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      dpr={[1, 2]} // Responsive pixel ratio
      performance={{ min: 0.5 }} // Performance threshold
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={0.6} color="#00ffff" />
      
      <Suspense fallback={null}>
        {/* Background Elements */}
        <BackgroundGrid />
        <FloatingLightOrbs />
        <FloatingLightBeams />
        <FloatingRings />
        <MaskPortal />
        
        {/* Animated Particles */}
        <AnimatedParticles count={performanceMode ? 80 : 200} />
        <MaskWave />
        
        {/* Floating Masks */}
        <FloatingMask 
          position={[-4, 0, 0]} 
          rotation={[0, 0, 0]} 
          scale={[0.6, 0.6, 0.6]} 
          color="#00ffff" 
        />
        <FloatingMask 
          position={[4, 1, 0]} 
          rotation={[0, Math.PI / 4, 0]} 
          scale={[0.4, 0.4, 0.4]} 
          color="#ff00ff" 
        />
        <FloatingMask 
          position={[0, -2, 3]} 
          rotation={[0, -Math.PI / 4, 0]} 
          scale={[0.5, 0.5, 0.5]} 
          color="#ffff00" 
        />
        <FloatingMask 
          position={[-6, 2, 1]} 
          rotation={[0, Math.PI / 2, 0]} 
          scale={[0.3, 0.3, 0.3]} 
          color="#ff8800" 
        />
        <FloatingMask 
          position={[6, -1, 2]} 
          rotation={[0, -Math.PI / 2, 0]} 
          scale={[0.4, 0.4, 0.4]} 
          color="#8800ff" 
        />
        
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
};

// 3D Floating Mask Hover Component - Optimized
const FloatingMaskHover = ({ isVisible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (meshRef.current && isVisible && state.clock.elapsedTime % 0.016 < 0.008) {
      meshRef.current.rotation.y += 0.01; // Reduced rotation speed
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.001; // Reduced movement
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, 0, 0]} 
      scale={isVisible ? [0.3, 0.3, 0.3] : [0, 0, 0]}
    >
      <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} /> {/* Reduced geometry complexity */}
      <meshStandardMaterial 
        color="#00ffff" 
        metalness={0.8} 
        roughness={0.2}
        transparent
        opacity={isVisible ? 0.6 : 0} // Reduced opacity
        depthWrite={false}
      />
    </mesh>
  );
};

// 3D Mask Wave Animation Component - Optimized
const MaskWave = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [positions, setPositions] = useState([]);
  
  useEffect(() => {
    const pos = [];
    for (let i = 0; i < 30; i++) { // Reduced count for performance
      pos.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
      });
    }
    setPositions(pos);
  }, []);

  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (groupRef.current && state.clock.elapsedTime % 0.032 < 0.016) { // 30fps optimization
      groupRef.current.rotation.y += 0.0005; // Reduced rotation speed
      groupRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, index) => (
        <mesh key={index} position={[pos.x, pos.y, pos.z]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.2} // Reduced opacity
            metalness={0.8}
            roughness={0.2}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Background Grid Component
const BackgroundGrid = () => {
  const gridRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.1) % 1;
    }
  });

  return (
    <mesh ref={gridRef} position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
        color="#00ffff"
        transparent
        opacity={0.05}
        wireframe
      />
    </mesh>
  );
};

// 3D Floating Light Orbs Component - Optimized
const FloatingLightOrbs = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [orbs, setOrbs] = useState([]);
  
  useEffect(() => {
    const orbPositions = [];
    for (let i = 0; i < 10; i++) { // Reduced count for performance
      orbPositions.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30,
        color: ['#00ffff', '#ff00ff', '#ffff00', '#ff8800', '#8800ff'][Math.floor(Math.random() * 5)],
        size: 0.2 + Math.random() * 0.3,
      });
    }
    setOrbs(orbPositions);
  }, []);

  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (groupRef.current && state.clock.elapsedTime % 0.032 < 0.016) { // 30fps optimization
      groupRef.current.rotation.y += 0.0003; // Reduced rotation speed
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, index) => (
        <mesh key={index} position={[orb.x, orb.y, orb.z]}>
          <sphereGeometry args={[orb.size, 12, 12]} /> {/* Reduced geometry complexity */}
          <meshStandardMaterial 
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.3} // Reduced intensity
            transparent
            opacity={0.4} // Reduced opacity
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Mask Portal Effect Component
const MaskPortal = () => {
  const portalRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z += 0.005;
      if (portalRef.current.material instanceof THREE.Material) {
        portalRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
      }
    }
  });

  return (
    <mesh ref={portalRef} position={[0, 0, -5]}>
      <ringGeometry args={[3, 5, 32]} />
      <meshStandardMaterial 
        color="#00ffff"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 3D Floating Light Beams Component - Optimized
const FloatingLightBeams = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (groupRef.current && state.clock.elapsedTime % 0.032 < 0.016) { // 30fps optimization
      groupRef.current.rotation.y += 0.0005; // Reduced rotation speed
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(6)].map((_, i) => ( // Reduced count for performance
        <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 15, 0, Math.sin(i * Math.PI / 3) * 15]}>
          <cylinderGeometry args={[0.1, 0.1, 20, 6]} /> {/* Reduced geometry complexity */}
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.15} // Reduced opacity
            emissive="#00ffff"
            emissiveIntensity={0.2} // Reduced intensity
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Floating Rings Component - Optimized
const FloatingRings = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Optimized animation with reduced frequency
  useFrame((state) => {
    if (groupRef.current && state.clock.elapsedTime % 0.032 < 0.016) { // 30fps optimization
      groupRef.current.rotation.y += 0.001; // Reduced rotation speed
      groupRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(4)].map((_, i) => ( // Reduced count for performance
        <mesh key={i} position={[0, 0, -i * 2]}>
          <ringGeometry args={[2 + i * 0.5, 2.5 + i * 0.5, 24]} /> {/* Reduced geometry complexity */}
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.08 - i * 0.02} // Reduced opacity
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// Unique Animated Words Component
const AnimatedScrollWords = ({ words, className = "" }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, words.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Background Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main Word Display */}
      <div className="relative z-10 flex justify-center items-center h-full">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Current Word */}
          <motion.div
            key={currentWordIndex}
            className="text-2xl md:text-3xl font-bold tracking-widest uppercase"
            initial={{ opacity: 0, x: 100, rotateY: 90 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -100, rotateY: -90 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <span className="bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent">
              {words[currentWordIndex]}
            </span>
          </motion.div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Side Words Preview */}
      <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
        <motion.div
          className="text-sm text-white/30 font-medium tracking-wider uppercase"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [-10, 0, -10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {words[(currentWordIndex - 1 + words.length) % words.length]}
        </motion.div>
        
        <motion.div
          className="text-sm text-white/30 font-medium tracking-wider uppercase"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [10, 0, 10],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {words[(currentWordIndex + 1) % words.length]}
        </motion.div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
        {words.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentWordIndex ? 'bg-cyan-400' : 'bg-white/20'
            }`}
            animate={{
              scale: index === currentWordIndex ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: index === currentWordIndex ? Infinity : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced PowerMaskCard Component with Improved Readability and Visual Impact
const PowerMaskCard = ({ product, index, isHovered, onHover, onQuickAdd, onToggleWishlist, isInWishlist }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  
  // Enhanced hover animations
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleHoverStart = () => {
    setIsAnimating(true);
    onHover(product.id);
  };
  
  const handleHoverEnd = () => {
    setIsAnimating(false);
    onHover(null);
  };

  const handleCardClick = () => {
    // Navigate to detail page with product data
    navigate(`/mask/${product.id}`, {
      state: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          gallery: product.gallery,
          rating: product.rating,
          reviews: product.reviews,
          isNew: product.isNew,
          isBestseller: product.isBestseller,
          colors: product.colors,
          sizes: product.sizes,
          category: product.category,
          section: product.section,
          features: product.features,
          description: product.description,
          material: product.material,
          protection: product.protection,
          washable: product.washable,
          availability: product.availability,
          shipping: product.shipping,
          brand: product.brand,
          collection: product.collection,
          modelNumber: product.modelNumber,
          placeOfOrigin: product.placeOfOrigin,
          applicableScenes: product.applicableScenes,
          gender: product.gender,
          ageGroup: product.ageGroup,
          moq: product.moq,
          sampleTime: product.sampleTime,
          packaging: product.packaging,
          singlePackageSize: product.singlePackageSize,
          singleGrossWeight: product.singleGrossWeight
        }
      }
    });
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation(); // Prevent card click when clicking cart button
    onQuickAdd(product);
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative h-[650px] rounded-3xl overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border border-border/50 shadow-2xl cursor-pointer"
      style={{ y, scale }}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleCardClick}
    >
      {/* Spotlight glow (match T-Shirt cards) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          transition: 'all 0.4s ease'
        }}
      />

      {/* Neon border (match T-Shirt cards) */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20"
        animate={isHovered ? {
          boxShadow: '0 0 30px 4px rgba(0, 212, 255, 0.3)',
          borderColor: 'rgba(0, 212, 255, 0.8)',
          opacity: 1
        } : {
          boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)',
          borderColor: 'rgba(0, 212, 255, 0.2)',
          opacity: 0.3
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      
      {/* Product Image with Effects */}
      <div className="relative h-3/5 overflow-hidden">
        <motion.img
          src={(isHovered && product.gallery && product.gallery[1] && product.gallery[1].type === 'image') ? product.gallery[1].src : product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        
        {/* Gradient Overlay for Better Text Readability */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          animate={isAnimating ? { opacity: 0.9 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {product.isNew && (
            <motion.div
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              NEW
            </motion.div>
          )}
          {product.isBestseller && (
            <motion.div
              className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              BESTSELLER
            </motion.div>
          )}
        </div>

        {/* Enhanced Rating & Reviews Badge */}
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/20"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-white">{product.rating}</span>
          {typeof product.reviews === 'number' && (
            <span className="text-xs text-white/80">({product.reviews})</span>
          )}
        </motion.div>

        {/* Discount Badge */}
        {product.originalPrice && product.price && product.originalPrice > product.price && (
          <motion.div
            className="absolute bottom-4 left-4 px-3 py-1.5 bg-red-600/90 text-white text-sm font-bold rounded-full shadow-lg border border-red-500/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.45 + index * 0.1 }}
          >
            {Math.max(1, Math.round((1 - (product.price / product.originalPrice)) * 100))}% OFF
          </motion.div>
        )}

          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <motion.button
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggleWishlist(product);
              }}
              aria-label="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current text-red-400' : ''}`} />
            </motion.button>
            <motion.button
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>
      </div>

      {/* Enhanced Content Section with Better Typography */}
      <div className="relative p-6 h-2/5 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/20">
        {/* Brand & Collection with Enhanced Visibility */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <motion.span
              className="px-3 py-1.5 text-sm font-bold text-white/90 bg-white/15 rounded-full backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              {product.brand}
            </motion.span>
            <motion.span
              className="px-3 py-1.5 text-sm font-bold text-cyan-300 bg-cyan-400/25 rounded-full backdrop-blur-sm border border-cyan-400/30"
              whileHover={{ scale: 1.05 }}
            >
              {product.collection}
            </motion.span>
          </div>
        </div>

        {/* Enhanced Product Title with Better Readability */}
        <motion.h3
          className="text-xl font-black text-white mb-3 leading-tight relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.span
            className="block"
            animate={isAnimating ? { 
              textShadow: "0 0 15px rgba(0, 212, 255, 0.8), 0 0 25px rgba(0, 212, 255, 0.4)" 
            } : { 
              textShadow: "0 2px 4px rgba(0,0,0,0.8)" 
            }}
            transition={{ duration: 0.3 }}
          >
            {product.name}
          </motion.span>
          
          {/* Enhanced Text Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-transparent blur-sm"
            animate={isAnimating ? { opacity: 0.6 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.h3>

        {/* Enhanced Description with Better Readability */}
        <motion.p
          className="text-sm text-white/80 mb-4 line-clamp-2 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {product.description.substring(0, 100)}...
        </motion.p>

        {/* Enhanced Color Swatches */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-white/70 font-medium">Colors:</span>
            {product.colors.slice(0, 4).map((c, i) => (
              <motion.div 
                key={`${c.name}-${i}`} 
                className="w-5 h-5 rounded-full border-2 border-white/30 shadow-md" 
                style={{ backgroundColor: c.value }}
                whileHover={{ scale: 1.1 }}
                title={c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-white/60 font-medium">+{product.colors.length - 4} more</span>
            )}
          </div>
        )}

        {/* Enhanced Key Features */}
        {Array.isArray(product.features) && product.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.features.slice(0, 3).map((feature, idx) => (
              <motion.span
                key={idx}
                className="px-3 py-1 text-xs font-medium bg-white/15 text-white/90 rounded-full backdrop-blur-sm border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                {feature}
              </motion.span>
            ))}
          </div>
        )}

        {/* Enhanced Price & Add to Cart Section */}
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              className="text-2xl font-black text-white mb-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              ${product.price}
            </motion.div>
            {product.originalPrice && (
              <div className="text-sm text-white/60 line-through font-medium">
                ${product.originalPrice}
              </div>
            )}
          </div>

          {/* Enhanced Add to Cart Button - Cart Icon Only */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="group relative p-3 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-400 text-white shadow-lg border-2 border-cyan-400/60 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 hover:shadow-cyan-400/50"
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            
            {/* Pulse animation on hover */}
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400/30"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ 
                scale: 1.4, 
                opacity: [0, 0.5, 0],
                transition: { duration: 0.6, repeat: Infinity }
              }}
            />
          </motion.button>
        </div>
      </div>

      {/* Animated Border Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        animate={isHovered ? {
          boxShadow: "inset 0 0 0 2px rgba(0, 212, 255, 0.3), 0 0 0 6px rgba(0, 212, 255, 0.05), 0 25px 80px -20px rgba(0,0,0,0.7)"
        } : {
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.div>
  );
};

const MaskCollection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { trackProduct, trackAddToCart } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Record<number, number>>({});
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});
  
  useEffect(() => {
    // Simulate loading time for 3D animations
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Check device performance and adjust quality
    const checkPerformance = () => {
      const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                           window.devicePixelRatio > 2 ||
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setPerformanceMode(isLowEndDevice);
    };
    
    checkPerformance();
    
    return () => clearTimeout(timer);
  }, []);
  

  // Enhanced mock mask products
  const mockMasks = [
    {
      id: 1,
      name: 'Full Ski Mask Hand Knitted Bear Balaclava Facemask with Chains',
      price: 7.55,
      originalPrice: null,
      image: s9775MaskImage2,
      gallery: [
        { type: 'image', src: s9775MaskImage1, alt: 'S9775 Mask Front View' },
        { type: 'image', src: s9775MaskImage2, alt: 'S9775 Mask Side View' },
        { type: 'image', src: s9775MaskImage3, alt: 'S9775 Mask Detail View' },
        { type: 'video', src: s9775MaskVideo, alt: 'S9775 Mask Product Video' }
      ],
      rating: 4.1,
      reviews: 98,
      isNew: true,
      isBestseller: false,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Brown', value: '#8B4513' }
      ],
      sizes: ['Adult Size'],
      category: 'Character',
      section: 'standard',
      features: ['Eco-friendly', 'Hand Knitted', 'Warm', 'Full Face Coverage', 'Custom Logo Available'],
      description: 'S9775 New 2023 Custom Christmas Hat Caps. Winter warm crochet full ski mask hand knitted bear balaclava facemask with chains. Perfect for outdoor activities, skiing, cycling, and daily use. Made from 100% acrylic material with character style design. Model: S9775, Brand: Sunland, Origin: Jiangsu, China.',
      material: '100% Acrylic',
      protection: 'Full Face Coverage',
      washable: 'Hand Wash Recommended',
      availability: 'In Stock',
      shipping: 'Standard Shipping',
      brand: 'Sunland',
      collection: 'Winter Essentials',
      modelNumber: 'S9775',
      placeOfOrigin: 'Jiangsu, China',
      applicableScenes: ['Beach', 'Casual', 'Outdoor', 'Travel', 'Sports', 'Cycling', 'Shopping', 'Party', 'Business', 'Fishing', 'SKI', 'Home Use', 'Daily'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      moq: '100 pieces',
      sampleTime: '5-7 days',
      packaging: 'One piece/OPP bag and 100pcs/ctn',
      singlePackageSize: '25X15X2 cm',
      singleGrossWeight: '0.150 kg'
    },
    {
      id: 2,
      name: 'Breathable Winter Warm Fleece Cycling Mask',
      price: 3.25,
      originalPrice: null,
      image: mask2Image1,
      gallery: [
        { type: 'image', src: mask2Image1, alt: 'Breathable Fleece Mask Front View' },
        { type: 'image', src: mask2Image2, alt: 'Breathable Fleece Mask Side View' },
        { type: 'image', src: mask2Image3, alt: 'Breathable Fleece Mask Detail View' },
        { type: 'image', src: mask2Image4, alt: 'Breathable Fleece Mask Usage View' },
        { type: 'image', src: mask2Image5, alt: 'Breathable Fleece Mask Stretch View' },
        { type: 'image', src: mask2Image6, alt: 'Breathable Fleece Mask Outdoor View' }
      ],
      rating: 4.8,
      reviews: 127,
      isNew: true,
      isBestseller: true,
      colors: [
        { name: 'Sky Blue', value: '#87CEEB' },
        { name: 'Purple', value: '#800080' },
        { name: 'Pink', value: '#FFC0CB' }
      ],
      sizes: ['One Size Fits Most'],
      category: 'Sports',
      section: 'standard',
      features: ['Breathable Design', 'Windproof Protection', 'Multi-Functional', 'Ergonomic Fit', 'Outdoor-Ready'],
      description: 'Breathable Winter Warm Fleece Cycling Mask – Cold & Windproof Head Cover. Stay protected and comfortable during outdoor winter activities with this breathable, warm fleece cycling head cover. Designed to shield you from cold, wind, and dust, it ensures maximum comfort without compromising breathability. Perfect for cycling, skiing, snowboarding, hiking, and other outdoor sports.',
      material: 'High-quality breathable fleece (polyester spandex)',
      protection: 'Windproof & Cold Protection',
      washable: 'Machine Washable',
      availability: 'In Stock',
      shipping: 'Standard Shipping',
      brand: 'Sewing Hub',
      collection: 'Winter Sports',
      modelNumber: 'sh-10053',
      placeOfOrigin: 'Pakistan',
      applicableScenes: ['Outdoor', 'Cycling', 'Skiing', 'Snowboarding', 'Hiking', 'Running', 'Motorcycling', 'Winter Sports'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      headCircumference: '50-52cm',
      printingMethods: 'Digital Printing',
      technics: 'Silk Screen Printing',
      needleDetection: 'Yes',
      keywords: 'Face Mask Hood Hat Cap',
      logo: 'Accept Customized Logo',
      color: 'Custom Color',
      usage: 'Sports Sunscreen',
      item: 'OEM Service Custom',
      sampleTime: '7 Working Days',
      label: 'Accept Customized Labels',
      oem: 'Accept OEM Customization',
      use: 'Outdoor Face Mask',
      sellingUnits: 'Single item',
      // Enhanced reviews data
      detailedReviews: [
        {
          rating: 5,
          title: "Perfect for cycling in winter!",
          content: "I use this every morning for my bike commute and it keeps my face warm even in strong wind. The fleece is soft, breathable, and doesn't make me feel suffocated. Fits perfectly under my helmet too.",
          author: "Cycling Enthusiast",
          verified: true
        },
        {
          rating: 5,
          title: "Great for skiing and snowboarding",
          content: "Wore this on a ski trip and it was amazing. My face stayed warm but I could still breathe easily. Didn't fog up my goggles either. Definitely worth it!",
          author: "Winter Sports Fan",
          verified: true
        },
        {
          rating: 4,
          title: "Warm and comfortable",
          content: "This mask is really cozy and windproof. The only thing is I wish it came in more colors, but overall it's a great buy for winter sports.",
          author: "Outdoor Adventurer",
          verified: true
        },
        {
          rating: 5,
          title: "Must-have for outdoor runners",
          content: "I go for runs even in freezing weather, and this mask makes a huge difference. Breathable, lightweight, and doesn't slip off while moving. Highly recommended.",
          author: "Marathon Runner",
          verified: true
        },
        {
          rating: 4,
          title: "Good quality, fits well",
          content: "The material feels premium and it stretches enough to fit comfortably. I used it for motorcycling in cold weather and it did the job well.",
          author: "Motorcycle Rider",
          verified: true
        }
      ]
    },
    {
      id: 3,
      name: 'Best Fabric Motorcycle Filter Mask Helmet Lining Breathable Balaclava',
      price: 12.99,
      originalPrice: 18.99,
      image: mask3Image1,
      gallery: [
        { type: 'image', src: mask3Image1, alt: 'Motorcycle Filter Mask Front View' },
        { type: 'image', src: mask3Image2, alt: 'Motorcycle Filter Mask Side View' },
        { type: 'image', src: mask3Image3, alt: 'Motorcycle Filter Mask Detail View' },
        { type: 'image', src: mask3Image5, alt: 'Motorcycle Filter Mask Stretch View' }
      ],
      rating: 4.6,
      reviews: 89,
      isNew: true,
      isBestseller: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Navy Blue', value: '#000080' },
        { name: 'Gray', value: '#808080' },
        { name: 'Dark Red', value: '#8B0000' },
        { name: 'Olive Green', value: '#808000' }
      ],
      sizes: ['48-50cm', '50-52cm', '52-54cm', '54-56cm', '56-58cm'],
      category: 'Motorcycle',
      section: 'standard',
      features: ['Dust & Pollution Protection', 'Helmet Lining Function', 'All-Season Use', 'Full Face & Neck Coverage', 'Ergonomic Design'],
      description: 'Best Fabric Motorcycle Filter Mask – Breathable Helmet Lining Balaclava & Neck Head Cover. Ride with comfort, safety, and confidence using this premium motorcycle balaclava and helmet liner.',
      material: 'High-performance breathable fabric (100% Polyester)',
      protection: 'Dust & Pollution Protection with Filter Layer',
      washable: 'Machine Washable',
      availability: 'In Stock',
      shipping: 'Standard Shipping',
      brand: 'CUSTOM',
      collection: 'Motorcycle Gear',
      modelNumber: 'MM-BC-0105',
      placeOfOrigin: 'Pakistan',
      applicableScenes: ['Outdoor', 'Casual', 'Motorcycling', 'Cycling', 'Skiing', 'Snowboarding', 'Hiking', 'Outdoor Work'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      headCircumference: '48-50cm, 50-52cm, 52-54cm, 54-56cm, 56-58cm',
      printingMethods: 'Digital Printing',
      technics: '3D Embroidery',
      needleDetection: 'NO',
      keywords: 'Top Quality Men Balaclava',
      logo: 'Accept Customized Logo',
      color: 'Customized Colors',
      design: 'Accept Custom Designs',
      moq: '20pcs',
      packing: 'Custom Packing',
      service: 'OEM Custom Service',
      quality: 'High Quality',
      label: 'Accept Customized Labels',
      usage: 'Helmet liner, face mask, balaclava, neck gaiter',
      detailedReviews: [
        {
          rating: 5,
          title: "Excellent under my helmet",
          content: "This balaclava fits perfectly under my motorcycle helmet. It keeps the sweat away, prevents itching, and makes the helmet much more comfortable to wear on long rides. Very breathable even in warm weather.",
          author: "Motorcycle Rider",
          verified: true
        },
        {
          rating: 5,
          title: "Great dust protection for city riding",
          content: "I ride daily in traffic, and this mask really helps filter out dust and pollution. Breathing feels easier, and I don't arrive home with my face covered in dirt. Plus, it's soft and doesn't irritate my skin.",
          author: "City Commuter",
          verified: true
        },
        {
          rating: 4,
          title: "Good quality, works in all seasons",
          content: "Used it in both summer and winter. In the heat, it keeps sweat under control, and in cold weather, it gives enough warmth around the neck. Only downside is I wish the filter was replaceable, but otherwise very solid.",
          author: "All-Season Rider",
          verified: true
        },
        {
          rating: 5,
          title: "Perfect for long rides",
          content: "I wore this on a 5-hour road trip. It stayed in place the entire time and kept me comfortable. No fogging in my visor and no itching. Definitely a must-have for bikers.",
          author: "Long Distance Rider",
          verified: true
        },
        {
          rating: 4,
          title: "Breathable and lightweight",
          content: "I was surprised at how light it feels. Doesn't make me sweat too much, even during summer rides. The fabric stretches well and fits snugly without being tight.",
          author: "Summer Rider",
          verified: true
        }
      ]
    },
    {
      id: 4,
      name: 'Winter Thermal Funny Character Balaclava 3D Cartoon Full Face Mask',
      price: 2.36,
      originalPrice: null,
      image: mask4Image1,
      gallery: [
        { type: 'image', src: mask4Image1, alt: 'Winter Thermal Balaclava Front View' },
        { type: 'image', src: mask4Image2, alt: 'Winter Thermal Balaclava Side View' },
        { type: 'image', src: mask4Image3, alt: 'Winter Thermal Balaclava Detail View' },
        { type: 'image', src: mask4Image4, alt: 'Winter Thermal Balaclava Usage View' },
        { type: 'image', src: mask4Image5, alt: 'Winter Thermal Balaclava Stretch View' },
        { type: 'image', src: mask4Image6, alt: 'Winter Thermal Balaclava Outdoor View' }
      ],
      rating: 4.3,
      reviews: 156,
      isNew: true,
      isBestseller: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Gray', value: '#808080' },
        { name: 'Navy Blue', value: '#000080' },
        { name: 'Red', value: '#FF0000' },
        { name: 'Green', value: '#008000' }
      ],
      sizes: ['56-58cm', '58-60cm', '60-62cm'],
      category: 'Character',
      section: 'standard',
      features: ['Thermal Protection', '3D Cartoon & Anime Prints', 'Full Face Coverage', 'Breathable & Stretchable', 'Multi-Functional Wear'],
      description: 'Winter Thermal 3D Cartoon Balaclava – Funny Character Full Face Mask for Motorcycle, Ski & Cosplay. Turn heads while staying warm with this unique winter thermal balaclava, featuring funny character and anime-inspired 3D cartoon prints.',
      material: '93% Polyester + 7% Spandex',
      protection: 'Thermal & Wind Protection',
      washable: 'Machine Washable',
      availability: 'In Stock',
      shipping: 'Standard Shipping',
      brand: 'ZRCE',
      collection: 'Winter Essentials',
      modelNumber: 'NKR',
      placeOfOrigin: 'Guangdong, China',
      applicableScenes: ['Sports', 'SKI', 'Outdoor', 'Daily', 'Casual', 'Business', 'Fishing', 'Cycling', 'Home Use'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      headCircumference: '56-58cm, 58-60cm, 60-62cm',
      printingMethods: 'Sublimation Transfer Print',
      technics: 'Heat-Transfer Printing',
      needleDetection: 'Yes',
      keywords: 'Thermal Ski Mask',
      logo: 'Accept Customized Logo',
      color: 'Picture Shows',
      size: 'Adult Size',
      moq: '2pcs',
      season: 'Winter',
      function: 'Keeping Warm',
      feature: 'Fashion, Comfortable, Durable',
      detailedReviews: [
        {
          rating: 4,
          title: "Perfect fit for small head",
          content: "Perfect! Fit small cus i got big head but material good",
          author: "j***z",
          verified: true
        },
        {
          rating: 4,
          title: "Good quality with small logo",
          content: "Hat is good quality logo small but perfect make I wish could be bigger",
          author: "E***n",
          verified: true
        },
        {
          rating: 5,
          title: "Great hats with awesome logos",
          content: "Great hats, logos look awesome, fast delivery, and easy to communicate with.",
          author: "P***s",
          verified: true
        },
        {
          rating: 5,
          title: "Professional supplier",
          content: "Fournisseur très professionnel et réactif. La communication est fluide, les délais sont respectés, et la qualité des produits est toujours au rendez-vous.",
          author: "E***s",
          verified: true
        },
        {
          rating: 5,
          title: "Good quality hats",
          content: "Good quality hats. Fast Delivery. Great Customer Service.",
          author: "C***z",
          verified: true
        }
      ]
    },
    {
      id: 5,
      name: 'Handmade Distress Crochet Ski Balaclava Helmet Cover',
      price: 6.85,
      originalPrice: null,
      image: mask5Image1,
      gallery: [
        { type: 'image', src: mask5Image1, alt: 'S9151 Handmade Crochet Ski Mask Front' },
        { type: 'image', src: mask5Image2, alt: 'S9151 Handmade Crochet Ski Mask Side' }
      ],
      rating: 4.4,
      reviews: 210,
      isNew: true,
      isBestseller: false,
      colors: [
        { name: 'Custom Colors', value: '#000000' }
      ],
      sizes: ['Adult Size'],
      category: 'Crochet',
      section: 'standard',
      features: ['Handmade Craftsmanship', 'Warm & Cozy', 'Distress Design', 'Helmet-Compatible', 'Multi-Purpose Wear'],
      description: 'S9151 Handmade Crochet Ski Mask – Distress Balaclava Winter Warm Helmet Cover. Unisex crochet hat that blends warmth, creativity, and edgy fashion. Perfect under helmets or as a statement winter accessory.',
      material: '100% Acrylic',
      protection: 'Full Face & Neck Coverage',
      washable: 'Hand Wash Recommended',
      availability: 'In Stock',
      shipping: 'Standard Shipping',
      brand: 'Sunland',
      collection: 'Winter Essentials',
      modelNumber: 'S9151',
      placeOfOrigin: 'Jiangsu, China',
      applicableScenes: ['Beach', 'Casual', 'Outdoor', 'Travel', 'Sports', 'Cycling', 'Shopping', 'Party', 'Business', 'Fishing', 'SKI', 'Home Use', 'Daily', 'Traveling'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      moq: '100 pieces',
      sampleTime: '5-7 days',
      packaging: 'One piece/OPP bag and 100pcs/ctn',
      singlePackageSize: '25X15X2 cm',
      singleGrossWeight: '0.150 kg',
      printingMethods: '—',
      technics: 'Dobby / Crochet',
      needleDetection: '—',
      keywords: 'Crochet Ski Mask, Distress Balaclava',
      logo: 'Custom Logo',
      color: 'Any color',
      usage: 'Motorcycling, skiing, fashion, cosplay, casual wear',
      item: 'Custom Women Men Motorcycle Helmet Cover Winter Warm Crochet Hat',
      label: 'Customizable',
      oem: 'Welcome',
      use: 'Winter Warmth & Style',
      sellingUnits: 'Single item',
      detailedReviews: [
        { rating: 5, title: 'Very satisfied', content: 'The goods have been received, the quality is very good, very satisfied', author: 'U***e (SG)', verified: true },
        { rating: 5, title: 'Will buy again', content: 'I am satisfied with this purchase, and will continue to buy next time if necessary', author: 'M***e (UK)', verified: true },
        { rating: 5, title: 'Great quality and service', content: 'Great quality of the product and fantastic customers service!', author: 'A***a (IS)', verified: true },
        { rating: 5, title: 'Beautiful colors, fast delivery', content: 'Beautiful colors and good quality. Great customer service. Fast delivery.', author: 'U***e (US)', verified: true },
        { rating: 5, title: 'Excellent communication', content: 'Great communication, sample is great quality and design is well done.', author: 'A***o (CR)', verified: true }
      ]
    },
  ];

  const filteredProducts = mockMasks.filter(product => 
    activeSection === 'all' || product.section === activeSection
  );

  const handleColorSelect = (productId: number, colorIndex: number) => {
    setSelectedColor(prev => ({ ...prev, [productId]: colorIndex }));
  };

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSize(prev => ({ ...prev, [productId]: size }));
  };

  // Custom isInWishlist function that checks both database and hardcoded products
  const isInWishlistCustom = (productId: string) => {
    // Check main wishlist (database products)
    const inMainWishlist = isInWishlist(productId);
    
    // Check hardcoded products localStorage
    const hardcodedWishlist = JSON.parse(localStorage.getItem('vlanco_hardcoded_wishlist') || '[]');
    const inHardcodedWishlist = hardcodedWishlist.some((item: any) => item.id === productId);
    
    return inMainWishlist || inHardcodedWishlist;
  };

  // Custom removeFromWishlist function for hardcoded products
  const removeFromWishlistCustom = async (productId: string) => {
    try {
      // Try to remove from main wishlist first
      await removeFromWishlist(productId);
    } catch (error) {
      // If that fails, remove from hardcoded wishlist
      const hardcodedWishlist = JSON.parse(localStorage.getItem('vlanco_hardcoded_wishlist') || '[]');
      const updatedWishlist = hardcodedWishlist.filter((item: any) => item.id !== productId);
      localStorage.setItem('vlanco_hardcoded_wishlist', JSON.stringify(updatedWishlist));
      
      // Show success toast
      toast({ 
        title: 'Removed from Wishlist', 
        description: 'Item has been removed from your wishlist',
        duration: 3000
      });
    }
  };

  const handleToggleWishlist = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      if (isInWishlistCustom(String(product.id))) {
        await removeFromWishlistCustom(String(product.id));
      } else {
        // Trigger blow-up animation
        setWishlistAnimating(product.id);
        
        // Create wishlist item with complete product information
        const wishlistItem = {
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          compare_price: product.originalPrice,
          image: product.image,
          images: product.gallery?.map((item: any) => item.src) || [],
          category: product.category || 'Masks',
          description: product.description,
          rating: product.rating,
          reviews: product.reviews,
          isLimited: product.isBestseller,
          isNew: product.isNew,
          colors: product.colors?.map((c: any) => c.name) || [],
          sizes: product.sizes || [],
          addedAt: new Date().toISOString()
        };
        
        // Store in localStorage for hardcoded products
        const existingWishlist = JSON.parse(localStorage.getItem('vlanco_hardcoded_wishlist') || '[]');
        const updatedWishlist = [...existingWishlist, wishlistItem];
        localStorage.setItem('vlanco_hardcoded_wishlist', JSON.stringify(updatedWishlist));
        
        // Show success toast
        toast({ 
          title: 'Added to Wishlist', 
          description: `${product.name} has been added to your wishlist`,
          duration: 3000
        });
        
        // Clear animation state after animation completes
        setTimeout(() => {
          setWishlistAnimating(null);
        }, 1000);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setWishlistAnimating(null);
      toast({ 
        title: 'Error', 
        description: 'Failed to update wishlist',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const handleQuickAdd = async (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Ensure a real variant exists for this mask selection
    const defaultColor = product.colors?.[0]?.name || 'Default';
    const defaultSize = product.sizes?.[0] || 'One Size';
    const sku = product.modelNumber || `MASK-${product.id}-${defaultColor}-${defaultSize}`;
    let variantId = '';
    try {
      const insertRes = await supabase
        .from('product_variants')
        .insert({
          product_id: String(product.id),
          color: defaultColor,
          size: defaultSize,
          price: Number(product.price) || 0,
          sku,
          stock_quantity: 999,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      if (insertRes.error) throw insertRes.error;
      variantId = String(insertRes.data.id);
    } catch (err) {
      const { data: existing } = await supabase
        .from('product_variants')
        .select('id')
        .eq('sku', sku)
        .maybeSingle();
      if (!existing?.id) throw err;
      variantId = String(existing.id);
    }

    await addToCart(product.id.toString(), variantId, 1, {
      price: product.price,
      product: { 
        id: String(product.id),
        name: product.name,
        base_price: Number(product.price) || 0,
        compare_price: Number(product.originalPrice) || null,
        description: product.description || `${product.name} - Premium mask collection`,
        image_url: product.image,
        image: product.image,
        images: product.gallery || [product.image],
        brand: product.brand || 'VLANCO',
        category: 'Masks',
        material: product.material || 'Premium Materials',
        protection: product.protection,
        rating_average: product.rating,
        rating_count: product.reviews,
        size_options: product.sizes || ['Adult Size'],
        color_options: product.colors?.map(c => c.name || c) || ['Default'],
        tags: product.tags || ['streetwear', 'mask', 'protection'],
        is_new_arrival: product.isNew || false,
        is_bestseller: product.isBestseller || false,
        stock_quantity: product.inStock ? 10 : 0,
        modelNumber: product.modelNumber
      },
      variant: { 
        id: variantId,
        product_id: String(product.id),
        price: Number(product.price) || 0,
        color: defaultColor,
        color_value: product.colors?.[0]?.value || '#000000',
        size: defaultSize,
        sku,
        stock_quantity: 10,
        is_active: true
      }
    });
  };

  return (
    <>
      {/* Brand Watermark Logo */}
      <WatermarkLogo className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0" />
      
      <div className="font-inter bg-black text-white min-h-screen">
        <Navigation />
        
        {/* 3D Loading Screen */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="fixed inset-0 z-50 bg-black flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-8">
                  <Canvas 
                    camera={{ position: [0, 0, 3], fov: 75 }}
                    gl={{ 
                      antialias: false,
                      powerPreference: "high-performance",
                      stencil: false,
                      depth: true
                    }}
                    dpr={[1, 1.5]} // Lower DPR for loading screen
                  >
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} />
                    <FloatingMask 
                      position={[0, 0, 0]} 
                      rotation={[0, 0, 0]} 
                      scale={[1, 1, 1]} 
                      color="#00ffff" 
                    />
                  </Canvas>
                </div>
                <motion.h2 
                  className="text-2xl font-bold text-white mb-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading Mask Collection...
                </motion.h2>
                <motion.div 
                  className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    animate={{ x: [-256, 256] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
                 {/* Hero Section with Animated Words */}
         <section className="relative min-h-[80vh] bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
           {/* Full-bleed animated space background (kept black) */}
           <AnimatedSpaceBackground className="absolute inset-0 w-full h-full opacity-60" starCount={320} maxSpeed={0.22} shootingStarIntervalMs={4200} />
           {/* 3D Background Scene */}
           <div className="absolute inset-0 opacity-30">
             <MaskScene performanceMode={performanceMode} />
           </div>
           
           {/* Animated Background */}
           <div className="absolute inset-0">
             <motion.div
               className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10"
               animate={{
                 background: [
                   "linear-gradient(45deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.1))",
                   "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(0, 212, 255, 0.05), rgba(139, 92, 246, 0.1))",
                   "linear-gradient(225deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05), rgba(0, 212, 255, 0.1))",
                 ]
               }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             />
           </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16">
            {/* Unique Animated Words */}
            <div className="mb-12">
              <AnimatedScrollWords 
                words={["Premium", "Exclusive", "Luxury", "Streetwear", "Designer", "Collection"]} 
                className="h-16"
              />
            </div>

            {/* Enhanced Hero Content */}
            <div className="text-center mb-16">
              {/* Animated Title Section */}
              <motion.div
                className="relative mb-12"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* Background Glow for Title */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-pink-500/20 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <motion.div
                  className="relative inline-flex items-center gap-6 mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  {/* Left Icon */}
                  <motion.div
                    className="relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ scale: 1.2, rotate: 180 }}
                  >
                    <Zap className="w-8 h-8 text-cyan-400" />
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/30 rounded-full blur-md"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>

                  {/* Main Title */}
                  <motion.h1 
                    className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <motion.span
                      className="block"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Mask Collection
                    </motion.span>
                    {/* Title Glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-transparent to-pink-400/20 blur-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.h1>

                  {/* Right Icon */}
                  <motion.div
                    className="relative p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30 backdrop-blur-sm"
                    animate={{ 
                      rotate: [360, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }
                    }}
                    whileHover={{ scale: 1.2, rotate: -180 }}
                  >
                    <Flame className="w-8 h-8 text-pink-400" />
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-pink-400/30 rounded-full blur-md"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Enhanced Description */}
              <motion.div
                className="relative mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <motion.p 
                  className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Discover our premium collection of streetwear masks, designed for those who dare to stand out.
                  </motion.span>
                  <br />
                  <motion.span
                    className="inline-block text-white/70"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    Each piece combines comfort, style, and authentic urban culture with advanced protection.
                  </motion.span>
                </motion.p>
                
                {/* Floating Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div
                className="flex flex-wrap justify-center gap-6"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                {[
                  { icon: <Package className="w-6 h-6" />, value: '8', label: 'Masks', color: 'cyan', delay: 0 },
                  { icon: <Users className="w-6 h-6" />, value: '1.2K+', label: 'Reviews', color: 'green', delay: 0.1 },
                  { icon: <Star className="w-6 h-6" />, value: '4.9', label: 'Rating', color: 'yellow', delay: 0.2 },
                  { icon: <TrendingUp className="w-6 h-6" />, value: '25%', label: 'Trending', color: 'purple', delay: 0.3 },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className={`relative flex flex-col items-center p-6 rounded-3xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 border border-${stat.color}-500/20 backdrop-blur-sm overflow-hidden`}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -8,
                      boxShadow: `0 20px 40px -12px rgba(0, 212, 255, 0.3)`
                    }}
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 1.2 + stat.delay, duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Background Glow */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r from-${stat.color}-500/20 via-transparent to-${stat.color}-600/20`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: stat.delay }}
                    />
                    
                    <motion.div 
                      className={`text-${stat.color}-400 mb-3 relative z-10`}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: stat.delay }}
                    >
                      {stat.icon}
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-white mb-1 relative z-10"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: stat.delay }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-white/70 font-medium relative z-10">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content with Subtle Background Enhancement */}
        <div ref={containerRef} className="relative py-16 overflow-hidden">
          {/* Subtle Background Enhancement */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  scale: [0, 1, 0],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Subtle gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Professional animated background accents (pixels + orbs) */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              {/* Animated pixel field */}
              <div className="absolute inset-0">
                {[...Array(36)].map((_, i) => (
                  <motion.div
                    key={`px-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-[2px] bg-cyan-400/30"
                    style={{
                      left: `${(i * 97) % 100}%`,
                      top: `${(i * 53) % 100}%`,
                    }}
                    animate={{
                      opacity: [0.15, 0.5, 0.15],
                      scale: [1, 1.6, 1],
                      y: [0, -4, 0],
                    }}
                    transition={{ duration: 4 + (i % 5) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: (i % 10) * 0.15 }}
                  />
                ))}
              </div>

              {/* Soft floating orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full blur-xl"
                  style={{
                    width: `${80 + (i % 3) * 40}px`,
                    height: `${80 + (i % 3) * 40}px`,
                    left: `${(i * 17 + 10) % 90}%`,
                    top: `${(i * 23 + 20) % 70}%`,
                    background: i % 2 === 0
                      ? 'radial-gradient(closest-side, rgba(34,211,238,0.25), transparent)'
                      : 'radial-gradient(closest-side, rgba(168,85,247,0.25), transparent)'
                  }}
                  animate={{
                    x: [0, i % 2 === 0 ? 10 : -10, 0],
                    y: [0, i % 2 === 0 ? -12 : 12, 0],
                    opacity: [0.25, 0.45, 0.25]
                  }}
                  transition={{ duration: 10 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              ))}

              {/* Subtle diagonal sweep */}
              <motion.div
                className="absolute -inset-x-10 -top-10 h-24 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-20%', '120%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {/* Enhanced Section Navigation */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Navigation Title */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Explore Our Collections
                </h2>
                <p className="text-white/60 text-sm">
                  Choose your preferred category to discover the perfect mask
                </p>
              </motion.div>

                             {/* Professional Filter Buttons */}
               <div className="flex flex-wrap justify-center gap-4">
                 {[
                   { id: 'all', label: 'All Masks', color: 'cyan', icon: <Sparkles className="w-4 h-4" /> },
                   { id: 'standard', label: 'Standard', color: 'blue', icon: <Shield className="w-4 h-4" /> },
                   { id: 'premium', label: 'Premium', color: 'purple', icon: <Crown className="w-4 h-4" /> },
                   { id: 'limited', label: 'Limited', color: 'yellow', icon: <Flame className="w-4 h-4" /> },
                   { id: 'exclusive', label: 'Exclusive', color: 'green', icon: <Award className="w-4 h-4" /> }
                 ].map((section, index) => (
                   <motion.div
                     key={section.id}
                     className="relative"
                     initial={{ opacity: 0, y: 20, scale: 0.9 }}
                     animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                     transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                   >
                     <motion.button
                       onClick={() => setActiveSection(section.id)}
                       className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-500 overflow-hidden group backdrop-blur-sm ${
                         activeSection === section.id
                           ? `bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 text-white shadow-2xl border-2 border-${section.color}-400/50`
                           : 'bg-white/5 text-white/70 hover:bg-white/10 border-2 border-white/10 hover:border-white/20 hover:text-white/90'
                       }`}
                       whileHover={{ 
                         scale: 1.05, 
                         y: -3,
                         boxShadow: activeSection === section.id 
                           ? `0 20px 40px -10px rgba(0, 212, 255, 0.4)`
                           : "0 10px 30px -5px rgba(255, 255, 255, 0.1)"
                       }}
                       whileTap={{ scale: 0.98 }}
                     >
                       {/* Professional Background Gradient */}
                       <motion.div
                         className={`absolute inset-0 bg-gradient-to-r from-${section.color}-500/10 to-${section.color}-600/10`}
                         animate={activeSection === section.id ? {
                           background: [
                             `linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(59, 130, 246, 0.2))`,
                             `linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 212, 255, 0.2))`,
                             `linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(59, 130, 246, 0.2))`
                           ]
                         } : {}}
                         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                       />

                       {/* Professional Icon and Text */}
                       <div className="relative z-10 flex items-center gap-3">
                         <motion.div
                           className={`${activeSection === section.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}
                           animate={activeSection === section.id ? {
                             rotate: [0, 360],
                             scale: [1, 1.1, 1]
                           } : {}}
                           transition={{ 
                             rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                             scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                           }}
                         >
                           {section.icon}
                         </motion.div>
                         <span className="font-bold text-sm tracking-wide uppercase">
                           {section.label}
                         </span>
                       </div>

                       {/* Professional Active Glow */}
                       {activeSection === section.id && (
                         <motion.div
                           className={`absolute inset-0 bg-gradient-to-r from-${section.color}-500/20 to-${section.color}-600/20 rounded-2xl blur-lg`}
                           animate={{
                             scale: [1, 1.05, 1],
                             opacity: [0.4, 0.7, 0.4],
                           }}
                           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                         />
                       )}

                       {/* Professional Hover Effect */}
                       <motion.div
                         className="absolute inset-0 bg-white/5 rounded-2xl"
                         initial={{ scale: 0, opacity: 0 }}
                         whileHover={{ 
                           scale: 1, 
                           opacity: 0.3,
                           transition: { duration: 0.3 }
                         }}
                       />
                     </motion.button>

                     {/* Professional Active Indicator */}
                     {activeSection === section.id && (
                       <motion.div
                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.4, delay: 0.1 }}
                       >
                         <motion.div
                           className="w-2 h-2 bg-white rounded-full"
                           animate={{
                             scale: [1, 1.2, 1],
                             opacity: [0.8, 1, 0.8],
                           }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                         />
                         <motion.div
                           className="w-1 h-1 bg-white/60 rounded-full"
                           animate={{
                             scale: [1, 1.1, 1],
                             opacity: [0.6, 0.9, 0.6],
                           }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                         />
                         <motion.div
                           className="w-1 h-1 bg-white/40 rounded-full"
                           animate={{
                             scale: [1, 1.05, 1],
                             opacity: [0.4, 0.7, 0.4],
                           }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                         />
                       </motion.div>
                     )}
                   </motion.div>
                 ))}
               </div>

              {/* Active Section Indicator */}
              <motion.div
                className="flex justify-center mt-6"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex gap-2">
                  {['all', 'standard', 'premium', 'limited', 'exclusive'].map((sectionId, index) => (
                    <motion.div
                      key={sectionId}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeSection === sectionId 
                          ? 'bg-cyan-400 scale-125' 
                          : 'bg-white/20'
                      }`}
                      animate={activeSection === sectionId ? {
                        scale: [1, 1.3, 1],
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Product Grid */}
            <motion.div
              className={`grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {filteredProducts.map((product, index) => {
                const colorOptions = product.colors || [];
                const sizeOptions = product.sizes || [];
                const colorIdx = selectedColor[product.id];
                const size = selectedSize[product.id];
                const canAdd = colorOptions.length > 0 ? colorIdx !== undefined : true;
                const canAddSize = sizeOptions.length > 0 ? !!size : true;
                return (
                  <motion.div
                    key={product.id}
                    className="group relative rounded-3xl overflow-hidden h-[650px]"
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{
                      y: -16,
                      scale: 1.03,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    onHoverStart={() => setHoveredProduct(product.id)}
                    onHoverEnd={() => setHoveredProduct(null)}
                    onClick={async () => {
                      const colorIdx = selectedColor[product.id];
                      const size = selectedSize[product.id] || '';
                      const params = new URLSearchParams();
                      
                      // Enhanced navigation with comprehensive product data
                      if (size) params.set('size', size);
                      if (colorIdx !== undefined) {
                        params.set('colorIdx', String(colorIdx));
                        const colorEntry = (product.colors || [])[colorIdx];
                        const colorName = typeof colorEntry === 'string' ? colorEntry : colorEntry?.name;
                        if (colorName) params.set('color', colorName);
                      }
                      
                      // Add additional context for better product detail experience
                      params.set('category', product.category);
                      params.set('price', product.price.toString());
                      if (product.originalPrice) params.set('originalPrice', product.originalPrice.toString());
                      params.set('rating', product.rating.toString());
                      params.set('reviews', product.reviews.toString());
                      
                      // Track product view analytics
                      try {
                        console.log('🎯 Tracking product view for mask:', product.id);
                        // Note: Need to add analytics import and hook usage at component level
                        console.log('✅ Product view analytics would be tracked here');
                      } catch (analyticsError) {
                        console.error('❌ Product view analytics tracking failed:', analyticsError);
                      }
                      
                      // Store selected options in session storage for seamless experience
                      sessionStorage.setItem(`product_${product.id}_options`, JSON.stringify({
                        selectedColor: colorIdx,
                        selectedSize: size,
                        productData: {
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          category: product.category,
                          rating: product.rating,
                          reviews: product.reviews,
                          isNew: product.isNew,
                          isBestseller: product.isBestseller
                        }
                      }));
                      
                      // Navigate with comprehensive product data in state
                      navigate(`/product/${product.id}${params.toString() ? `?${params.toString()}` : ''}`, {
                        state: {
                          product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            image: product.image,
                            gallery: product.gallery || [product.image],
                            images: product.gallery || [product.image],
                            rating: product.rating,
                            reviews: product.reviews,
                            isNew: product.isNew,
                            isBestseller: product.isBestseller,
                            colors: product.colors,
                            sizes: product.sizes,
                            category: product.category,
                            section: product.section,
                            features: product.features || [
                              'Premium Quality Materials',
                              'Advanced Protection',
                              'Comfortable Fit',
                              'Durable Construction'
                            ],
                            description: product.description || `${product.name} - Premium mask collection`,
                            material: product.material || 'Premium Materials',
                            protection: product.protection,
                            washable: product.washable,
                            availability: product.availability,
                            shipping: product.shipping,
                            brand: product.brand || 'VLANCO',
                            collection: product.collection || 'Mask Collection',
                            modelNumber: product.modelNumber || `MASK-${product.id}`,
                            placeOfOrigin: product.placeOfOrigin,
                            applicableScenes: product.applicableScenes,
                            gender: product.gender,
                            ageGroup: product.ageGroup,
                            moq: product.moq,
                            sampleTime: product.sampleTime,
                            packaging: product.packaging,
                            singlePackageSize: product.singlePackageSize,
                            singleGrossWeight: product.singleGrossWeight,
                            from: 'mask_collection'
                          }
                        }
                      });
                    }}
                  >
                    {/* Enhanced Card Container */}
                    <motion.div 
                      className="relative bg-gradient-to-br from-background via-muted/20 to-background rounded-3xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-500 group-hover:shadow-3xl group-hover:border-primary/30 h-full"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Enhanced Dynamic Spotlight Glow */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-10"
                        animate={hoveredProduct === product.id ? { opacity: 1 } : { opacity: 0 }}
                        style={{
                          background: 'radial-gradient(circle at 60% 40%, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
                          transition: 'all 0.4s ease',
                        }}
                      />
                      
                      {/* Enhanced Animated Neon Border */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20"
                        animate={hoveredProduct === product.id ? {
                          boxShadow: '0 0 30px 4px rgba(0, 212, 255, 0.3)',
                          borderColor: 'rgba(0, 212, 255, 0.8)',
                          opacity: 1
                        } : {
                          boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)',
                          borderColor: 'rgba(0, 212, 255, 0.2)',
                          opacity: 0.3
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      
                      {/* Enhanced Product Image Container */}
                      <div className={`relative overflow-hidden h-full`}> 
                        {/* Base Image */}
                        <motion.img
                          ref={el => (imageRefs.current[product.id] = el)}
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ imageRendering: 'auto' }}
                          animate={hoveredProduct === product.id ? { 
                            scale: 1.05,
                            filter: 'blur(0px)'
                          } : { 
                            scale: 1,
                            filter: 'blur(0px)'
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeOut",
                            filter: { duration: 0.4, ease: "easeInOut" }
                          }}
                        />
                        
                        {/* Hover Image with Cross-Fade */}
                        <motion.img
                          src={product.gallery?.[1]?.src || product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ imageRendering: 'auto' }}
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={hoveredProduct === product.id ? { 
                            opacity: 1,
                            scale: 1.05,
                            filter: 'blur(0px)'
                          } : { 
                            opacity: 0,
                            scale: 1.02,
                            filter: 'blur(1px)'
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeInOut",
                            opacity: { duration: 0.7, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" },
                            filter: { duration: 0.4, ease: "easeInOut" }
                          }}
                        />
                        
                        {/* Enhanced Gradient Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"
                          initial={{ opacity: 0.4 }}
                          animate={hoveredProduct === product.id ? { opacity: 0.7 } : { opacity: 0.4 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        
                        {/* Transition Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-500/20 z-5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={hoveredProduct === product.id ? { 
                            opacity: 1,
                            scale: 1.1
                          } : { 
                            opacity: 0,
                            scale: 1
                          }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeInOut",
                            opacity: { duration: 0.6, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" }
                          }}
                        />
                        
                        {/* Enhanced Floating Hologram Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                          {product.isNew && (
                            <motion.span 
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-white text-xs font-bold rounded-full shadow-lg"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              NEW
                            </motion.span>
                          )}
                          {product.isBestseller && (
                            <motion.span 
                              className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg"
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                              BESTSELLER
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Enhanced Rating Badge */}
                        <motion.div
                          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/20 z-20"
                          initial={{ opacity: 0, x: 20, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                          transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-white">{product.rating}</span>
                        </motion.div>
                      </div>
                      
                      {/* Enhanced Product Info with Optimized Layout */}
                      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 flex flex-col gap-3">
                        {/* Enhanced Category and Reviews */}
                        <div className="flex items-center justify-between mb-1">
                          <motion.span 
                            className="text-xs font-bold text-cyan-400 bg-cyan-400/20 px-3 py-1.5 rounded-full border border-cyan-400/40 shadow-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            {product.category}
                          </motion.span>
                          <div className="flex items-center gap-1.5 text-xs text-white/90">
                            <Users className="w-3 h-3" />
                            <span className="font-semibold">{product.reviews}</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Product Title */}
                        <h3 className="text-lg font-black text-white drop-shadow-lg group-hover:text-cyan-300 transition-colors duration-300 mb-2 leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Product Features and Material */}
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1">
                            {product.features?.slice(0, 2).map((feature, idx) => (
                              <motion.span
                                key={idx}
                                className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-md border border-white/20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + idx * 0.1 }}
                              >
                                {feature}
                              </motion.span>
                            ))}
                            {product.material && (
                              <motion.span
                                className="text-xs text-cyan-300 bg-cyan-400/20 px-2 py-1 rounded-md border border-cyan-400/30"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {product.material}
                              </motion.span>
                            )}
                            {product.features?.length > 2 && (
                              <span className="text-xs text-white/60 px-2 py-1 bg-white/5 rounded-md">
                                +{product.features.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Brand and Collection Info */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            {product.brand && (
                              <span className="font-semibold text-cyan-300">{product.brand}</span>
                            )}
                            {product.collection && (
                              <span className="text-white/60">• {product.collection}</span>
                            )}
                            {product.modelNumber && (
                              <span className="text-white/50">• {product.modelNumber}</span>
                            )}
                          </div>
                          {/* Availability and Shipping Info */}
                          <div className="flex items-center gap-2 mt-1">
                            {product.availability && (
                              <span className="text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-md">
                                {product.availability}
                              </span>
                            )}
                            {product.shipping && (
                              <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-0.5 rounded-md">
                                {product.shipping}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Available Options Info - No Selectors */}
                        <div className="mb-3 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-white/70">Colors:</div>
                            <div className="flex items-center gap-1">
                              {product.colors.slice(0, 3).map((color, colorIndex) => (
                                <div
                                  key={colorIndex}
                                  className="w-3 h-3 rounded-full border border-white/30"
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                              {product.colors.length > 3 && (
                                <span className="text-xs text-white/60 ml-1">+{product.colors.length - 3}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-white/70">Sizes:</div>
                            <div className="text-xs text-white/90 font-medium">
                              {product.sizes.slice(0, 2).join(', ')}
                              {product.sizes.length > 2 && ` +${product.sizes.length - 2} more`}
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Price and Add to Cart */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-4">
                            <motion.span 
                              className="text-3xl font-black text-white drop-shadow-lg"
                              whileHover={{ scale: 1.05 }}
                            >
                              ${product.price}
                            </motion.span>
                            {product.originalPrice && (
                              <span className="text-lg text-white/60 line-through font-bold">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Enhanced Add to Cart Button - Cart Icon Only */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdd(product);
                              }}
                              className="group relative p-4 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-400 text-white shadow-xl border-2 border-cyan-400/60 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 hover:shadow-cyan-400/50 hover:shadow-2xl"
                              whileHover={{ 
                                scale: 1.1,
                                rotate: [0, -5, 5, 0],
                                transition: { duration: 0.3 }
                              }}
                              whileTap={{ scale: 0.95 }}
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-6 h-6" />
                              
                              {/* Pulse animation on hover */}
                              <motion.div
                                className="absolute inset-0 rounded-full bg-cyan-400/30"
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ 
                                  scale: 1.4, 
                                  opacity: [0, 0.5, 0],
                                  transition: { duration: 0.6, repeat: Infinity }
                                }}
                              />
                            </motion.button>
                            {/* Enhanced Wishlist Button with Blow-up Animation */}
                            <motion.button
                              onClick={(e) => handleToggleWishlist(product, e)}
                              className={`p-4 rounded-full shadow-xl border-2 transition-all duration-300 ${
                                isInWishlistCustom(String(product.id))
                                  ? 'bg-red-500/20 text-red-500 border-red-500/60 hover:bg-red-500/30'
                                  : 'bg-white/15 text-white hover:bg-white/25 border-white/30'
                              }`}
                              whileHover={{ 
                                scale: 1.15,
                                boxShadow: isInWishlistCustom(String(product.id)) 
                                  ? '0 0 25px rgba(239, 68, 68, 0.6)' 
                                  : '0 0 25px rgba(255, 255, 255, 0.3)'
                              }}
                              whileTap={{ 
                                scale: 0.9,
                                transition: { duration: 0.1 }
                              }}
                              animate={wishlistAnimating === product.id ? {
                                scale: [1, 1.4, 1],
                                boxShadow: [
                                  '0 0 0px rgba(239, 68, 68, 0)',
                                  '0 0 40px rgba(239, 68, 68, 1)',
                                  '0 0 0px rgba(239, 68, 68, 0)'
                                ]
                              } : {}}
                              transition={{
                                scale: { duration: 0.3, ease: "easeOut" },
                                boxShadow: { duration: 0.3, ease: "easeOut" }
                              }}
                              title={isInWishlistCustom(String(product.id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              <motion.div
                                animate={wishlistAnimating === product.id ? {
                                  scale: [1, 1.3, 1],
                                  rotate: [0, 15, -15, 0]
                                } : {}}
                                transition={{
                                  duration: 0.5,
                                  ease: "easeOut"
                                }}
                              >
                                <Heart className={`w-5 h-5 transition-all duration-300 ${
                                  isInWishlistCustom(String(product.id)) 
                                    ? 'text-red-500 fill-red-500' 
                                    : 'text-white'
                                }`} />
                              </motion.div>
                              
                              {/* Blow-up Effect Overlay */}
                              <motion.div
                                className="absolute inset-0 rounded-full bg-red-500/40"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={wishlistAnimating === product.id ? {
                                  scale: [0, 2.5, 0],
                                  opacity: [0, 1, 0]
                                } : {}}
                                transition={{
                                  duration: 0.8,
                                  ease: "easeOut"
                                }}
                              />
                              
                              {/* Pulse Effect */}
                              <motion.div
                                className="absolute inset-0 rounded-full border-2 border-red-500/70"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={wishlistAnimating === product.id ? {
                                  scale: [1, 2, 1],
                                  opacity: [0, 0.8, 0]
                                } : {}}
                                transition={{
                                  duration: 1,
                                  ease: "easeOut",
                                  delay: 0.1
                                }}
                              />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No masks found</h3>
                <p className="text-white/60 mb-6">Try adjusting your filters</p>
                <motion.button
                  onClick={() => setActiveSection('all')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show All Masks
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode="signin"
      />
    </>
  );
};

export default MaskCollection;
