import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export const FloatingLogo = () => {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main 3D Logo - Larger and more prominent */}
      <mesh>
        <boxGeometry args={[4, 1.5, 0.8]} />
        <meshStandardMaterial 
          color="#60a5fa" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#1e40af"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* VLANCO Text on the box */}
      <mesh position={[0, 0, 0.5]}>
        <planeGeometry args={[3.5, 1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#60a5fa"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Add some floating elements around it */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 4) * 3,
          Math.sin(i * Math.PI / 4) * 3,
          0
        ]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#60a5fa"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Additional glow effect */}
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[5, 2, 0.2]} />
        <meshStandardMaterial 
          color="#60a5fa" 
          transparent
          opacity={0.3}
          emissive="#1e40af"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}; 