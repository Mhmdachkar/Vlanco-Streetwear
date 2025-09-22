import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
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
import photo1Image from '@/assets/ChatGPT Image Aug 29, 2025, 03_00_21 AM.png';
import product1Image from '@/assets/1.png';
import product2Image from '@/assets/3.png';
import product3Image from '@/assets/4.png';
import product4Image from '@/assets/hero-bg.jpg';

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

// Import premium mask 1 media files (Le Angelo Balaclava)
import premiumMask1Image1 from '@/assets/premium_mask1/Screenshot 2025-09-20 160225.png';
import premiumMask1Image2 from '@/assets/premium_mask1/Screenshot 2025-09-20 160235.png';
import premiumMask1Image3 from '@/assets/premium_mask1/Screenshot 2025-09-20 160245.png';
import premiumMask1Image4 from '@/assets/premium_mask1/Screenshot 2025-09-20 160252.png';
import premiumMask1Image5 from '@/assets/premium_mask1/Screenshot 2025-09-20 160301.png';
import premiumMask1Image6 from '@/assets/premium_mask1/Screenshot 2025-09-20 160310.png';
import premiumMask1Image7 from '@/assets/premium_mask1/Screenshot 2025-09-20 160318.png';

// Import premium mask 2 media files (TRUST Ski Mask)
import premiumMask2Image1 from '@/assets/premium_mask2/Screenshot 2025-09-20 180641.png';

// Import premium mask 3 media files (TATTO Mask)
import premiumMask3Image1 from '@/assets/premium_mask3/Screenshot 2025-09-20 180839.png';

// Import services
import { toggleWishlistItem } from '@/services/wishlistService';

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
        <AnimatedParticles count={performanceMode ? 0 : 0} />
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
const PowerMaskCard = ({ product, index, isHovered, onHover, onQuickAdd, onToggleWishlist, isInWishlist, wishlistAnimating }) => {
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

  const isInView = useInView(cardRef, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      data-product-id={product.id}
      className="group relative h-[650px] rounded-3xl overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background border border-border/50 shadow-2xl cursor-pointer"
      style={{ y, scale, transformStyle: 'preserve-3d' }}
      initial={{ 
        opacity: 0, 
        y: 100, 
        scale: 0.8,
        rotateY: index % 2 === 0 ? -15 : 15,
        rotateX: -20
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateY: 0,
        rotateX: 0
      } : { 
        opacity: 0, 
        y: 100, 
        scale: 0.8,
        rotateY: index % 2 === 0 ? -15 : 15,
        rotateX: -20
      }}
      transition={{ 
        duration: 1.2, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleCardClick}
    >
      {/* Morphing Border Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none z-5"
        style={{
          background: `linear-gradient(${isHovered ? '315deg' : '45deg'}, 
            rgba(0, 212, 255, 0.2), rgba(59, 130, 246, 0.1), rgba(0, 212, 255, 0.2))`
        }}
        animate={{
          background: `linear-gradient(${isHovered ? '315deg' : '45deg'}, 
            rgba(0, 212, 255, 0.2), rgba(59, 130, 246, 0.1), rgba(0, 212, 255, 0.2))`
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Spotlight glow (match T-Shirt cards) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          transition: 'all 0.4s ease'
        }}
      />

      {/* Enhanced Neon border with pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20"
        animate={isHovered ? {
          boxShadow: '0 0 30px 4px rgba(0, 212, 255, 0.3)',
          borderColor: 'rgba(0, 212, 255, 0.8)',
          opacity: 1,
          scale: [1, 1.02, 1]
        } : {
          boxShadow: '0 0 0px 0px rgba(0, 212, 255, 0)',
          borderColor: 'rgba(0, 212, 255, 0.2)',
          opacity: 0.3,
          scale: 1
        }}
        transition={{ 
          duration: 0.5, 
          ease: 'easeOut',
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Particle Burst Effect on Entrance */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-15"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0 0'
            }}
            initial={{ 
              scale: 0, 
              x: 0, 
              y: 0, 
              opacity: 0 
            }}
            animate={isInView ? {
              scale: [0, 1, 0],
              x: Math.cos((i * 30) * Math.PI / 180) * 100,
              y: Math.sin((i * 30) * Math.PI / 180) * 100,
              opacity: [0, 1, 0]
            } : {}}
            transition={{
              duration: 1.5,
              delay: index * 0.1 + 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      {/* Dynamic Light Sweep Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-12"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 212, 255, 0.2) 50%, 
            transparent 100%)`,
          transform: 'translateX(-100%)'
        }}
        animate={isHovered ? {
          x: ['-100%', '100%']
        } : {}}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 2
        }}
      />
      
      {/* Product Image with Effects */}
      <div className="relative h-3/5 overflow-hidden">
        {/* Base Image with Enhanced Styling */}
        <motion.img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            imageRendering: 'auto',
            filter: 'brightness(1.1) contrast(1.1) saturate(1.05)'
          }}
          initial={{ 
            scale: 0.3, 
            rotate: index % 2 === 0 ? -180 : 180,
            x: index % 3 === 0 ? -200 : index % 3 === 1 ? 200 : 0,
            y: index % 4 === 0 ? -150 : index % 4 === 1 ? 150 : index % 4 === 2 ? -100 : 100,
            opacity: 0,
            filter: 'blur(10px) brightness(0.5)'
          }}
          animate={isInView ? {
            scale: 1,
            rotate: 0,
            x: 0,
            y: 0,
            opacity: 1,
            filter: 'brightness(1.1) contrast(1.1) saturate(1.05) blur(0px)'
          } : {}}
          transition={{
            duration: 1.2,
            delay: index * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />

        {/* Hover Image with 3D Flip Effect */}
        <motion.img
          src={(isHovered && product.gallery && product.gallery[1] && product.gallery[1].type === 'image') ? product.gallery[1].src : product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            imageRendering: 'auto',
            filter: 'brightness(1.1) contrast(1.1) saturate(1.05)',
            transformStyle: 'preserve-3d'
          }}
          initial={{ 
            opacity: 0, 
            scale: 1.02, 
            rotateY: 90,
            z: -50
          }}
          animate={isHovered ? {
            opacity: 1,
            scale: 1.1,
            rotateY: 0,
            z: 0,
            filter: 'brightness(1.2) contrast(1.2) saturate(1.1) blur(0px)'
          } : {
            opacity: 0,
            scale: 1.02,
            rotateY: 90,
            z: -50,
            filter: 'brightness(1.1) contrast(1.1) saturate(1.05)'
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 0.8, ease: "easeOut" },
            rotateY: { duration: 0.8, ease: "easeOut" }
          }}
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
            {/* Enhanced Wishlist Button with Blow-up Animation */}
            <motion.button
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggleWishlist(product, e);
              }}
              className={`p-2.5 rounded-full shadow-lg border-2 transition-all duration-300 ${
                isInWishlist(product.id)
                  ? 'bg-red-500/20 text-red-500 border-red-500/60 hover:bg-red-500/30'
                  : 'bg-white/15 text-white hover:bg-white/25 border-white/30'
              }`}
              whileHover={{ 
                scale: 1.1,
                boxShadow: isInWishlist(product.id) 
                  ? '0 0 20px rgba(239, 68, 68, 0.6)' 
                  : '0 0 20px rgba(255, 255, 255, 0.3)'
              }}
              whileTap={{ 
                scale: 0.9,
                transition: { duration: 0.1 }
              }}
              animate={wishlistAnimating === product.id ? {
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 0px rgba(239, 68, 68, 0)',
                  '0 0 30px rgba(239, 68, 68, 1)',
                  '0 0 0px rgba(239, 68, 68, 0)'
                ]
              } : {}}
              transition={{
                scale: { duration: 0.3, ease: "easeOut" },
                boxShadow: { duration: 0.3, ease: "easeOut" }
              }}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label="Add to Wishlist"
            >
              <motion.div
                animate={wishlistAnimating === product.id ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{
                  duration: 0.4,
                  ease: "easeOut"
                }}
              >
                <Heart className={`w-4 h-4 transition-all duration-300 ${
                  isInWishlist(product.id) 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white'
                }`} />
              </motion.div>
              
              {/* Blow-up Effect Overlay */}
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/40"
                initial={{ scale: 0, opacity: 0 }}
                animate={wishlistAnimating === product.id ? {
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0]
                } : {}}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
              />
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
      <div className="relative p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/20 gap-3">
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
          className="text-base xs:text-lg sm:text-xl lg:text-2xl font-black text-white mb-1.5 sm:mb-2 leading-tight relative line-clamp-2"
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

        {/* Key stats row (rating • reviews • stock) */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] xs:text-xs sm:text-sm text-white/80">
          {typeof product.rating === 'number' && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
              <span className="font-semibold text-white">{product.rating.toFixed(1)}</span>
            </div>
          )}
          {typeof product.reviews === 'number' && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
              <span>{product.reviews}+ reviews</span>
            </div>
          )}
          {(product.stock_quantity || product.stock) && (
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span>In stock</span>
            </div>
          )}
        </div>

        {/* Enhanced Description with Better Readability */}
        <motion.p
          className="hidden xs:block text-xs sm:text-sm text-white/80 mb-2 sm:mb-3 line-clamp-2 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(product.description || '').substring(0, 120)}...
        </motion.p>

        {/* Enhanced Color Swatches */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
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
          <div className="hidden sm:flex flex-wrap gap-2 mb-3">
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
        <div className="flex items-end justify-between gap-3 sm:gap-4">
          <div>
            <motion.div
              className="text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1"
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
            className="group relative p-3 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-400 text-white shadow-lg border-2 border-cyan-400/60 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 hover:shadow-cyan-400/50 w-full sm:w-auto flex items-center justify-center"
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
  const isInView = useInView(containerRef, { once: false, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const reduceAnimations = prefersReducedMotion || performanceMode || isTouchDevice;
  const [wishlistAnimating, setWishlistAnimating] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Record<number, number>>({});
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});
  const imageRefs = useRef<Record<number, HTMLImageElement | null>>({});
  
  // Memoized hover handlers to prevent re-renders
  const handleHoverStart = useCallback((productId: number) => {
    setHoveredProduct(productId);
  }, []);
  
  const handleHoverEnd = useCallback(() => {
    setHoveredProduct(null);
  }, []);
  
  // Memoized image component to prevent reloading
  const MemoizedImage = React.memo(React.forwardRef<HTMLImageElement, any>(({ src, alt, className, style, animate, transition, initial }, ref) => (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      animate={animate}
      transition={transition}
      initial={initial}
      loading="lazy"
      decoding="async"
    />
  )));
  
  // Fly to cart animation function (fixed selector)
  const flyToCart = (productId: number) => {
    
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productElement) {
      return;
    }

    // Try multiple selectors to find the cart button
    const cartButton = document.querySelector('#cart-icon') || 
                      document.querySelector('[data-cart-icon]') || 
                      document.querySelector('.cart-icon') || 
                      document.querySelector('[data-cart-button]');
    
    if (!cartButton) {
      return;
    }

    const productRect = productElement.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();
    

    const productImg = productElement.querySelector('img') as HTMLImageElement;
    if (!productImg) {
      return;
    }

    const floatingImg = document.createElement('img');
    floatingImg.src = productImg.src;
    floatingImg.style.cssText = `
      position: fixed;
      left: ${productRect.left + productRect.width / 2}px;
      top: ${productRect.top + productRect.height / 2}px;
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      z-index: 10000;
      pointer-events: none;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(floatingImg);

    requestAnimationFrame(() => {
      floatingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
      floatingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
      floatingImg.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(360deg)';
      floatingImg.style.opacity = '0';
    });

    setTimeout(() => {
      if (document.body.contains(floatingImg)) {
        document.body.removeChild(floatingImg);
      }
    }, 850);
  };
  
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
      name: 'Le Angelo Balaclava Mask - Handmade Ski Mask',
      price: 890.00,
      originalPrice: 1275.00,
      discount: 30,
      image: premiumMask1Image1,
      gallery: [
        { type: 'image', src: premiumMask1Image1, alt: 'Le Angelo Balaclava Front View' },
        { type: 'image', src: premiumMask1Image2, alt: 'Le Angelo Balaclava Side View' },
        { type: 'image', src: premiumMask1Image3, alt: 'Le Angelo Balaclava Detail View' },
        { type: 'image', src: premiumMask1Image4, alt: 'Le Angelo Balaclava Profile View' },
        { type: 'image', src: premiumMask1Image5, alt: 'Le Angelo Balaclava Close-up' },
        { type: 'image', src: premiumMask1Image6, alt: 'Le Angelo Balaclava Wearing View' },
        { type: 'image', src: premiumMask1Image7, alt: 'Le Angelo Balaclava Lifestyle' }
      ],
      rating: 4.9,
      reviews: 156,
      isNew: true,
      isBestseller: true,
      isPremium: true,
      colors: [
        { name: 'White', value: '#FFFFFF' }
      ],
      sizes: ['One Size Fits All'],
      category: 'Premium',
      section: 'premium',
      features: ['Handmade', 'Limited Edition', 'Natural Fibers', 'Anatomical Cut', 'Elegant Design', 'Street Style'],
      description: 'The Le Angelo Balaclava Mask is designed entirely by hand, with the meticulous craftsmanship of our masters. Knitted from soft, breathable, and durable natural fibers, this mask provides maximum protection in cold weather. Its anatomical cut adapts perfectly to facial contours, while its unique design adds an elegant and distinctive touch to street style. It\'s the first choice for those seeking an accessory that\'s both functional and aesthetically pleasing.',
      material: 'Soft, breathable, and durable natural fibers',
      protection: 'Maximum Cold Weather Protection',
      washable: 'Hand Wash Recommended',
      availability: 'In Stock',
      shipping: 'Free Shipping | 1-7 Business Days',
      brand: 'VLANCO',
      collection: 'Premium Collection',
      modelNumber: 'LA-BAL-001',
      placeOfOrigin: 'Handcrafted',
      applicableScenes: ['Winter Sports', 'Street Style', 'Outdoor Activities', 'Fashion', 'Cold Weather'],
      gender: 'Unisex',
      ageGroup: 'Adults',
      moq: 'Limited Edition',
      sampleTime: '1-7 Business Days',
      packaging: 'Premium Gift Box',
      singlePackageSize: 'Premium Packaging',
      singleGrossWeight: 'Lightweight',
      discountText: '30% OFF',
      shippingInfo: 'Free Shipping | 1-7 Business Days',
      limitedEdition: true,
      handmade: true
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
    {
      id: 2,
      name: 'TRUST Ski Mask',
      price: 590.00,
      originalPrice: 850.00,
      discount: 30,
      image: premiumMask2Image1,
      gallery: [
        { type: 'image', src: premiumMask2Image1, alt: 'TRUST Ski Mask Front View' }
      ],
      rating: 4.8,
      reviews: 89,
      isNew: true,
      isBestseller: false,
      isPremium: true,
      colors: [
        { name: 'Black', value: '#000000' }
      ],
      sizes: ['One Size'],
      category: 'Ski Mask',
      features: [
        'Thick Soft Texture',
        'Stealthy Silhouette',
        'Relaxed Fit',
        'All-Day Comfort'
      ],
      description: 'The TRUST Ski Mask is made for those who never compromise on style, from city streets to slippery slopes. Its thick, soft texture keeps you warm while giving you a stealthy silhouette. Its stitching details stand out and its relaxed fit offers all-day comfort. Are you ready to reflect street culture on your face?',
      material: 'High-Quality Fabric',
      protection: 'Cold Weather Protection',
      washable: true,
      availability: 'In Stock',
      shipping: 'Free Shipping',
      shippingInfo: 'Free Shipping | 1-7 Business Days',
      brand: 'VLANCO',
      collection: 'Premium Collection',
      modelNumber: 'MASK-PREMIUM-002',
      placeOfOrigin: 'Turkey',
      applicableScenes: 'Winter Sports, Street Style, Outdoor Activities',
      gender: 'Unisex',
      ageGroup: 'Adult',
      moq: 1,
      sampleTime: '3-5 days',
      packaging: 'Premium Gift Box',
      singlePackageSize: '25cm x 20cm x 5cm',
      singleGrossWeight: '200g',
      section: 'premium'
    },
    {
      id: 3,
      name: 'TATTO Mask',
      price: 590.00,
      originalPrice: 850.00,
      discount: 30,
      image: premiumMask3Image1,
      gallery: [
        { type: 'image', src: premiumMask3Image1, alt: 'TATTO Mask Front View' }
      ],
      rating: 4.7,
      reviews: 67,
      isNew: true,
      isBestseller: false,
      isPremium: true,
      colors: [
        { name: 'Black', value: '#000000' }
      ],
      sizes: ['One Size'],
      category: 'Street Mask',
      features: [
        'High-Quality Breathable Fabric',
        'Flexible & Durable',
        'Anatomical Cut',
        'Perfect Fit'
      ],
      description: 'The TATTO Mask offers all-day comfort with its high-quality, breathable, and flexible fabric. Its thin yet durable construction offers protection in cold weather while also being the boldest way to express yourself with style. Its meticulously crafted details and anatomical cut ensure a perfect fit for your facial features. Designed for those who value both street style and functionality, its durable fabric stands up to washing and extended wear. It\'s not just a mask; it\'s an essential accessory for your style.',
      material: 'High-Quality Breathable Fabric',
      protection: 'Cold Weather Protection',
      washable: true,
      availability: 'In Stock',
      shipping: 'Free Shipping',
      shippingInfo: 'Free Shipping | 1-7 Business Days',
      brand: 'VLANCO',
      collection: 'Premium Collection',
      modelNumber: 'MASK-PREMIUM-003',
      placeOfOrigin: 'Turkey',
      applicableScenes: 'Street Style, Daily Wear, Fashion',
      gender: 'Unisex',
      ageGroup: 'Adult',
      moq: 1,
      sampleTime: '3-5 days',
      packaging: 'Premium Gift Box',
      singlePackageSize: '25cm x 20cm x 5cm',
      singleGrossWeight: '150g',
      section: 'preorder'
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
    try {
      // Create comprehensive wishlist item with all product information
      const wishlistItem = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        compare_price: product.originalPrice,
        image: product.image,
        images: product.gallery?.map((item: any) => item.src) || [product.image],
        category: product.category || 'Masks',
        description: product.description,
        rating: product.rating,
        reviews: product.reviews,
        isLimited: product.isLimited || false,
        isNew: product.isNew || false,
        isBestseller: product.isBestseller || false,
        colors: product.colors?.map((c: any) => c.name || c) || ['Default'],
        sizes: product.sizes || ['One Size'],
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
        features: product.features || [],
        tags: product.tags || ['streetwear', 'mask', 'protection']
      };
      
      // Use unified wishlist service (works for guests and authenticated users)
      const success = await toggleWishlistItem(wishlistItem, user?.id);
      
      if (success && !isInWishlistCustom(String(product.id))) {
        // Trigger blow-up animation only when adding (not removing)
        setWishlistAnimating(product.id);
        
        // Clear animation after delay
        setTimeout(() => setWishlistAnimating(null), 1000);
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
    e?.stopPropagation();
    
    
    // Use default selections or pre-selected ones
    const size = selectedSize[product.id] || product.sizes?.[0] || 'One Size';
    const colorIndex = selectedColor[product.id] !== undefined ? selectedColor[product.id] : 0;
    const selectedColorData = product.colors?.[colorIndex] || product.colors?.[0];
    
    
    // Analytics tracking (fire and forget - don't block cart addition)
    
    // Fire and forget analytics - don't await
    Promise.race([
      trackAddToCart(String(product.id), `mask_${product.id}_${colorIndex}_${size}`, 1, product.price),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analytics timeout')), 3000)
      )
    ]).then(() => {
    }).catch((analyticsError) => {
    });
    
    
    // Animation
    flyToCart(product.id);
    
    // Simplified approach: Just call addToCart with complete product details
    try {
      
      // Create a unique variant ID for this combination
      const variantId = `mask_${product.id}_${colorIndex}_${size}`;
      const sku = `${product.id}-${colorIndex}-${size}`;
      
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
          color: selectedColorData?.name || 'Default',
          color_value: selectedColorData?.value || '#000000',
          size: size,
          sku,
          stock_quantity: 10,
          is_active: true
        }
      });
      
      
      // Show success toast
      toast({
        title: "🚀 DEPLOYED TO VAULT!",
        description: `${product.name} - ${size} - ${selectedColorData?.name || 'Default'}`,
        duration: 3000
      });
    } catch (error) {
      // Error handling - no console logging needed
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
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
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 px-2"
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
                    className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent relative px-2"
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
                  className="text-base xs:text-lg sm:text-xl md:text-2xl text-white/90 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl mx-auto leading-relaxed font-light px-3 sm:px-4"
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 px-2">
                  Explore Our Collections
                </h2>
                <p className="text-white/60 text-xs sm:text-sm px-2 mx-auto max-w-md sm:max-w-lg">
                  Choose your preferred category to discover the perfect mask
                </p>
              </motion.div>

                             {/* Professional Filter Buttons - Enhanced Mobile Responsiveness */}
               <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 p-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
                 {[
                   { id: 'all', label: 'All Masks', color: 'cyan', icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> },
                   { id: 'premium', label: 'Premium', color: 'purple', icon: <Crown className="w-3 h-3 sm:w-4 sm:h-4" /> },
                   { id: 'preorder', label: 'Preorder', color: 'blue', icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4" /> }
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
                       className={`relative px-3 xs:px-4 sm:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl font-semibold transition-all duration-500 overflow-hidden group backdrop-blur-sm text-xs xs:text-sm sm:text-base lg:text-lg ${
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
                       <div className="relative z-10 flex items-center gap-2 sm:gap-3">
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
                  {['all', 'premium', 'preorder'].map((sectionId, index) => (
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

            {/* Product Grid - Enhanced Mobile Responsiveness */}
            <motion.div
              className={`grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-2 sm:px-4 md:px-6 lg:px-8`}
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
                
                // Individual card ref and inView detection
                const cardRef = useRef(null);
                const cardInView = useInView(cardRef, { once: true, margin: "-50px" });
                
                // Memoize animation values to prevent re-triggering on hover
                const entranceAnimation = useMemo(() => {
                  if (!cardInView) return {};
                  return reduceAnimations ? {
                    opacity: 1,
                    y: 0,
                    scale: 1
                  } : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateY: 0,
                    rotateX: 0
                  };
                }, [cardInView, reduceAnimations]);
                
                const imageAnimation = useMemo(() => {
                  if (!cardInView) return {};
                  return {
                    scale: 1,
                    rotate: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                    filter: 'brightness(1.1) contrast(1.1) saturate(1.05)'
                  };
                }, [cardInView]);
                
                
                return (
                    <motion.div
                      ref={cardRef}
                      key={product.id}
                      className="group relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden h-auto sm:h-[500px] md:h-[550px] lg:h-[650px]"
                      style={{ transformStyle: 'preserve-3d' }}
                      initial={reduceAnimations ? {
                        opacity: 0,
                        y: 30,
                        scale: 0.95
                      } : {
                        opacity: 0,
                        y: 60,
                        scale: 0.9,
                        rotateY: index % 2 === 0 ? -10 : 10,
                        rotateX: -10
                      }}
                      animate={entranceAnimation}
                      transition={{ 
                        duration: reduceAnimations ? 0.45 : 0.8, 
                        delay: reduceAnimations ? Math.min(index * 0.02, 0.2) : index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    whileHover={reduceAnimations ? { scale: 1.01 } : {
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    onHoverStart={() => handleHoverStart(product.id)}
                    onHoverEnd={handleHoverEnd}
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
                        // Note: Need to add analytics import and hook usage at component level
                      } catch (analyticsError) {
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
                    {/* Elegant Card Container with Modern Layout */}
                    <motion.div 
                      data-product-id={product.id}
                      className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-500 group-hover:shadow-2xl h-full flex flex-col ${
                        product.isPremium 
                          ? 'bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 border-purple-500/30 group-hover:border-purple-400/60' 
                          : 'bg-gradient-to-br from-slate-900/95 via-slate-800/20 to-slate-900/95 border-slate-700/30 group-hover:border-slate-600/50'
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                      initial={reduceAnimations ? {
                        opacity: 0,
                        y: 30,
                        scale: 0.95
                      } : {
                        opacity: 0,
                        y: 80,
                        scale: 0.9,
                        rotateY: index % 2 === 0 ? -10 : 10,
                        rotateX: -10
                      }}
                      animate={isInView ? (reduceAnimations ? {
                        opacity: 1,
                        y: 0,
                        scale: 1
                      } : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateY: 0,
                        rotateX: 0
                      }) : {}}
                      transition={{ 
                        duration: reduceAnimations ? 0.6 : 1.0, 
                        delay: reduceAnimations ? Math.min(index * 0.03, 0.25) : index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={reduceAnimations ? { scale: 1.03 } : {
                        scale: 1.05, 
                        rotateY: 5,
                        rotateX: 2,
                        y: -20,
                        z: 50
                      }}
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Subtle Border Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none z-5"
                        style={{
                          background: `linear-gradient(45deg, 
                            ${product.isPremium 
                              ? 'rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.15)' 
                              : 'rgba(0, 212, 255, 0.1), rgba(59, 130, 246, 0.05), rgba(0, 212, 255, 0.1)'
                            })`
                        }}
                        animate={hoveredProduct === product.id ? {
                          opacity: 0.8
                        } : {
                          opacity: 0.4
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />

                      {/* Subtle Spotlight Glow */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-10"
                        animate={hoveredProduct === product.id ? { opacity: 0.3 } : { opacity: 0 }}
                        style={{
                          background: product.isPremium 
                            ? 'radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)'
                            : 'radial-gradient(circle at 60% 40%, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                      
                      {/* Subtle Border Highlight */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl border-2 pointer-events-none z-20 ${
                          product.isPremium ? 'border-purple-500/40' : 'border-primary/40'
                        }`}
                        animate={hoveredProduct === product.id ? {
                          borderColor: product.isPremium 
                            ? 'rgba(168, 85, 247, 0.6)'
                            : 'rgba(0, 212, 255, 0.5)',
                          opacity: 1
                        } : {
                          borderColor: product.isPremium 
                            ? 'rgba(168, 85, 247, 0.3)'
                            : 'rgba(0, 212, 255, 0.2)',
                          opacity: 0.3
                        }}
                        transition={{ 
                          duration: 0.2, 
                          ease: "easeOut"
                        }}
                      />

                      {/* Particle Burst Effect on Entrance */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-15"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${
                              product.isPremium ? 'bg-purple-400' : 'bg-cyan-400'
                            }`}
                            style={{
                              left: '50%',
                              top: '50%',
                              transformOrigin: '0 0'
                            }}
                            initial={{ 
                              scale: 0, 
                              x: 0, 
                              y: 0, 
                              opacity: 0 
                            }}
                            animate={isInView ? {
                              scale: [0, 1, 0],
                              x: Math.cos((i * 30) * Math.PI / 180) * 100,
                              y: Math.sin((i * 30) * Math.PI / 180) * 100,
                              opacity: [0, 1, 0]
                            } : {}}
                            transition={{
                              duration: 1.5,
                              delay: index * 0.1 + 0.3,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </motion.div>

                      
                      {/* Elegant Photo Section - Responsive Height */}
                      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden"> 
                        {/* Base Image with Enhanced Styling */}
                        <motion.img
                          ref={el => (imageRefs.current[product.id] = el)}
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            imageRendering: 'auto',
                            filter: 'brightness(1.1) contrast(1.1) saturate(1.05)'
                          }}
                          initial={{ 
                            scale: 0.3, 
                            rotate: index % 2 === 0 ? -180 : 180,
                            x: index % 3 === 0 ? -200 : index % 3 === 1 ? 200 : 0,
                            y: index % 4 === 0 ? -150 : index % 4 === 1 ? 150 : index % 4 === 2 ? -100 : 100,
                            opacity: 0,
                            filter: 'blur(10px) brightness(0.5)'
                          }}
                          animate={imageAnimation}
                          transition={{
                            duration: 1.2,
                            delay: index * 0.15,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                        
                        {/* Hover Overlay for subtle blur effect */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backdropFilter: 'blur(0px)',
                            transition: 'backdrop-filter 0.2s ease'
                          }}
                          animate={{
                            backdropFilter: hoveredProduct === product.id ? 'blur(0.5px)' : 'blur(0px)'
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                        
                        {/* Hover Image with 3D Flip Effect */}
                        <motion.img
                          src={product.gallery?.[1]?.src || product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            imageRendering: 'auto',
                            filter: 'brightness(1.1) contrast(1.1) saturate(1.05)',
                            transformStyle: 'preserve-3d'
                          }}
                          initial={{ 
                            opacity: 0, 
                            scale: 1.02, 
                            rotateY: 90,
                            z: -50
                          }}
                          animate={hoveredProduct === product.id ? {
                            opacity: 1,
                            scale: 1.08,
                            rotateY: 0,
                            z: 0
                          } : {
                            opacity: 0,
                            scale: 1.02,
                            rotateY: 90,
                            z: -50
                          }}
                          transition={{
                            duration: 0.8,
                            ease: [0.25, 0.46, 0.45, 0.94],
                            opacity: { duration: 0.5, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" },
                            rotateY: { duration: 0.8, ease: "easeOut" }
                          }}
                        />
                        
                        {/* Dynamic Gradient Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"
                          initial={{ opacity: 0.3 }}
                          animate={hoveredProduct === product.id ? { 
                            opacity: 0.5,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%, transparent 100%)'
                          } : { 
                            opacity: 0.3,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 50%, transparent 100%)'
                          }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        />

                        {/* Floating Elements Effect */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none z-15"
                          animate={hoveredProduct === product.id ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={`absolute w-2 h-2 rounded-full ${
                                product.isPremium ? 'bg-purple-400/60' : 'bg-cyan-400/60'
                              }`}
                              style={{
                                left: `${20 + (i * 15)}%`,
                                top: `${30 + (i * 10)}%`,
                              }}
                              animate={hoveredProduct === product.id ? {
                                y: [0, -20, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.6, 1, 0.6]
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </motion.div>
                        
                        {/* Enhanced Transition Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-500/20 z-5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={hoveredProduct === product.id ? {
                            opacity: 1,
                            scale: 1.1,
                            rotate: 5
                          } : {
                            opacity: 0,
                            scale: 1,
                            rotate: 0
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                            opacity: { duration: 0.6, ease: "easeInOut" },
                            scale: { duration: 0.8, ease: "easeOut" },
                            rotate: { duration: 1.2, ease: "easeInOut" }
                          }}
                        />

                        {/* Card Flip Effect on Hover */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none z-25"
                          style={{ transformStyle: 'preserve-3d' }}
                          animate={hoveredProduct === product.id ? {
                            rotateY: 2,
                            rotateX: 1,
                            perspective: 1000
                          } : {
                            rotateY: 0,
                            rotateX: 0,
                            perspective: 1000
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        
                        {/* Elegant Floating Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                          {product.isPremium && (
                            <motion.span 
                              className="px-2.5 py-1 bg-gradient-to-r from-purple-600/90 via-pink-500/90 to-purple-400/90 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm border border-purple-300/30"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.05, rotate: 2 }}
                            >
                              <Crown className="w-3 h-3 inline mr-1" />
                              PREMIUM
                            </motion.span>
                          )}
                          {product.discount && (
                            <motion.span 
                              className="px-2.5 py-1 bg-gradient-to-r from-red-500/90 via-orange-500/90 to-yellow-500/90 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm border border-red-300/30"
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.05, rotate: -2 }}
                            >
                              {product.discount}% OFF
                            </motion.span>
                          )}
                          {product.isNew && !product.isPremium && (
                            <motion.span 
                              className="px-2.5 py-1 bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-cyan-400/90 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.05, rotate: 2 }}
                            >
                              NEW
                            </motion.span>
                          )}
                          {product.isBestseller && !product.isPremium && (
                            <motion.span 
                              className="px-2.5 py-1 bg-gradient-to-r from-yellow-500/90 via-orange-500/90 to-red-500/90 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm"
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.05, rotate: -2 }}
                            >
                              BESTSELLER
                            </motion.span>
                          )}
                        </div>
                        
                        {/* Elegant Rating Badge */}
                        <motion.div
                          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg border border-white/10 z-20"
                          initial={{ opacity: 0, x: 20, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                          transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold text-white">{product.rating}</span>
                        </motion.div>
                      </div>
                      
                      {/* Elegant Info Section - 3D Enhanced */}
                      <div className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
        {/* 3D Background Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-slate-900/30 pointer-events-none"
          initial={{ opacity: 0, rotateX: 90 }}
          animate={isInView ? { opacity: 1, rotateX: 0 } : { opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
        />

                        {/* Header Section - 3D Enhanced */}
                        <div className="space-y-2 relative z-10">
                          {/* Category and Reviews */}
                          <div className="flex items-center justify-between">
                            <motion.span 
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm border ${
                                product.isPremium 
                                  ? 'text-purple-200 bg-purple-500/30 border-purple-400/50'
                                  : 'text-cyan-300 bg-cyan-500/30 border-cyan-400/50'
                              }`}
                              initial={{ opacity: 0, y: 20, rotateX: -45 }}
                              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 20, rotateX: -45 }}
                              transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
                              whileHover={{ 
                                scale: 1.02, 
                                rotateY: 1,
                                boxShadow: product.isPremium 
                                  ? '0 2px 10px rgba(168, 85, 247, 0.1)'
                                  : '0 2px 10px rgba(0, 212, 255, 0.1)'
                              }}
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {product.category}
                            </motion.span>
                            <motion.div 
                              className="flex items-center gap-1 text-xs text-slate-400"
                              initial={{ opacity: 0, x: 20, rotateY: 45 }}
                              animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 20, rotateY: 45 }}
                              transition={{ duration: 0.5, delay: index * 0.05 + 0.4 }}
                              whileHover={{ scale: 1.01, rotateY: -1 }}
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              <Users className="w-3 h-3" />
                              <span className="font-medium">{product.reviews}</span>
                            </motion.div>
                          </div>
                        
                          {/* Product Title - 3D Enhanced */}
                          <motion.h3 
                            className={`text-lg font-bold leading-tight line-clamp-2 transition-colors duration-300 ${
                              product.isPremium 
                                ? 'text-white group-hover:text-purple-200'
                                : 'text-white group-hover:text-cyan-300'
                            }`}
                            initial={{ opacity: 0, y: 30, rotateX: -60, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 30, rotateX: -60, scale: 0.8 }}
                            transition={{ duration: 0.6, delay: index * 0.05 + 0.5, ease: "easeOut" }}
                            whileHover={{ 
                              scale: 1.005, 
                              rotateY: 0.5,
                              textShadow: product.isPremium 
                                ? '0 0 10px rgba(168, 85, 247, 0.2)'
                                : '0 0 10px rgba(0, 212, 255, 0.2)'
                            }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            {product.name}
                          </motion.h3>
                        
                          {/* Features - 3D Enhanced */}
                          <div className="flex flex-wrap gap-1">
                            {product.features?.slice(0, 2).map((feature, idx) => (
                              <motion.span
                                key={idx}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium backdrop-blur-sm border ${
                                  product.isPremium 
                                    ? 'text-purple-200 bg-purple-500/30 border-purple-400/50'
                                    : 'text-cyan-200 bg-cyan-500/30 border-cyan-400/50'
                                }`}
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, rotateX: 0, y: 0 } : { opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: index * 0.05 + 0.6 + idx * 0.05,
                                  ease: "easeOut"
                                }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  rotateY: 2,
                                  rotateX: 1,
                                  boxShadow: product.isPremium 
                                    ? '0 2px 8px rgba(168, 85, 247, 0.2)'
                                    : '0 2px 8px rgba(0, 212, 255, 0.2)'
                                }}
                                style={{ transformStyle: 'preserve-3d' }}
                              >
                                {feature}
                              </motion.span>
                            ))}
                            {product.features?.length > 2 && (
                              <motion.span 
                                className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-400 bg-slate-700/40 border border-slate-600/50 backdrop-blur-sm"
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, rotateX: 0, y: 0 } : { opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                transition={{ 
                                  duration: 0.6, 
                                  delay: index * 0.1 + 0.9,
                                  ease: "easeOut"
                                }}
                                whileHover={{ 
                                  scale: 1.1, 
                                  rotateY: -10,
                                  rotateX: 5
                                }}
                                style={{ transformStyle: 'preserve-3d' }}
                              >
                                +{product.features.length - 2} more
                              </motion.span>
                            )}
                          </div>
                        </div>
                        
                        {/* Footer Section - 3D Enhanced */}
                        <div className="space-y-2 relative z-10">
                          {/* Price Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <motion.span
                                  className={`text-2xl font-bold ${
                                    product.isPremium ? 'text-purple-200' : 'text-white'
                                  }`}
                                  initial={{ opacity: 0, y: 20, rotateX: -45, scale: 0.8 }}
                                  animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0, y: 20, rotateX: -45, scale: 0.8 }}
                                  transition={{ duration: 0.6, delay: index * 0.05 + 0.8 }}
                                  whileHover={{ 
                                    scale: 1.01, 
                                    rotateY: 1,
                                    textShadow: product.isPremium 
                                      ? '0 0 10px rgba(168, 85, 247, 0.2)'
                                      : '0 0 10px rgba(0, 212, 255, 0.2)'
                                  }}
                                  style={{ transformStyle: 'preserve-3d' }}
                                >
                                  {product.isPremium ? `${product.price} TL` : `$${product.price}`}
                                </motion.span>
                                {product.originalPrice && (
                                  <motion.span 
                                    className={`text-sm line-through font-medium ${
                                      product.isPremium ? 'text-slate-400' : 'text-slate-500'
                                    }`}
                                    initial={{ opacity: 0, x: -20, rotateY: -45 }}
                                    animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: -20, rotateY: -45 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 + 0.9 }}
                                    whileHover={{ scale: 1.01, rotateY: 1 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                  >
                                    {product.isPremium ? `${product.originalPrice} TL` : `$${product.originalPrice}`}
                                  </motion.span>
                                )}
                              </div>
                              {product.discount && (
                                <motion.div
                                  className="flex items-center gap-1.5 mt-2"
                                  initial={{ opacity: 0, y: 15, rotateX: -30 }}
                                  animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 15, rotateX: -30 }}
                                  transition={{ duration: 0.5, delay: index * 0.05 + 1.0 }}
                                >
                                  <motion.span 
                                    className="text-xs text-green-400 bg-green-500/30 px-2.5 py-1.5 rounded-lg border border-green-400/50 backdrop-blur-sm"
                                    whileHover={{ 
                                      scale: 1.02, 
                                      rotateY: 2,
                                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                                    }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                  >
                                    Save {product.originalPrice - product.price} TL
                                  </motion.span>
                                  {product.shippingInfo && (
                                    <motion.span 
                                      className="text-xs text-blue-400 bg-blue-500/30 px-2.5 py-1.5 rounded-lg border border-blue-400/50 backdrop-blur-sm"
                                      whileHover={{ 
                                        scale: 1.02, 
                                        rotateY: -2,
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                                      }}
                                      style={{ transformStyle: 'preserve-3d' }}
                                    >
                                      {product.shippingInfo}
                                    </motion.span>
                                  )}
                                </motion.div>
                              )}
                            </div>
                        
                            {/* Action Buttons - 3D Enhanced */}
                            <div className="flex items-center gap-2">
                              {/* Add to Cart Button */}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAdd(product);
                                }}
                                className={`group relative p-3 rounded-lg text-white shadow-lg border transition-all duration-300 hover:shadow-xl ${
                                  product.isPremium 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-400/50 hover:from-purple-700 hover:to-pink-600'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400/50 hover:from-cyan-600 hover:to-blue-600'
                                }`}
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, rotateX: 0, y: 0 } : { opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                transition={{ duration: 0.6, delay: index * 0.05 + 1.1 }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  rotateY: 2,
                                  rotateX: 1,
                                  boxShadow: product.isPremium 
                                    ? '0 3px 15px rgba(168, 85, 247, 0.2)'
                                    : '0 3px 15px rgba(0, 212, 255, 0.2)'
                                }}
                                whileTap={{ scale: 0.98, rotateY: -1 }}
                                style={{ transformStyle: 'preserve-3d' }}
                                title="Add to Cart"
                              >
                                <ShoppingCart className="w-5 h-5" />
                              </motion.button>
                              {/* Wishlist Button */}
                              <motion.button
                                onClick={(e) => handleToggleWishlist(product, e)}
                                className={`p-3 rounded-lg shadow-lg border transition-all duration-300 ${
                                  isInWishlistCustom(String(product.id))
                                    ? 'bg-red-500/20 border-red-400/50 text-red-400 hover:bg-red-500/30'
                                    : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                                }`}
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, rotateX: 0, y: 0 } : { opacity: 0, scale: 0.5, rotateX: -90, y: 20 }}
                                transition={{ duration: 0.6, delay: index * 0.05 + 1.2 }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  rotateY: -2,
                                  rotateX: 1,
                                  boxShadow: isInWishlistCustom(String(product.id))
                                    ? '0 3px 15px rgba(239, 68, 68, 0.2)'
                                    : '0 3px 15px rgba(71, 85, 105, 0.2)'
                                }}
                                whileTap={{ scale: 0.98, rotateY: 1 }}
                                style={{ transformStyle: 'preserve-3d' }}
                                title={isInWishlistCustom(String(product.id)) ? "Remove from Wishlist" : "Add to Wishlist"}
                              >
                                <Heart className={`w-5 h-5 ${isInWishlistCustom(String(product.id)) ? 'fill-current' : ''}`} />
                              </motion.button>
                            </div>
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
