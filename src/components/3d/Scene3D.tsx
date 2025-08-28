import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { FloatingLogo } from "./FloatingLogo";
import { ParticleField } from "./ParticleField";
import { Product3D } from "./Product3D";

interface Scene3DProps {
  className?: string;
  showProducts?: boolean;
}

export const Scene3D = ({ className, showProducts = false }: Scene3DProps) => {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          {/* Basic Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            color="#ffffff"
          />
          
          {/* Simple Background */}
          <mesh position={[0, 0, -10]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          
          {/* Main Logo */}
          <FloatingLogo />
          
          {/* Particle Field */}
          <ParticleField />
          
          {/* 3D Products */}
          {showProducts && (
            <>
              <Product3D type="tshirt" position={[-3, 0, 0]} />
              <Product3D type="mask" position={[0, 0, -3]} />
              <Product3D type="accessory" position={[3, 0, 0]} />
            </>
          )}
          
          {/* Simple Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}; 