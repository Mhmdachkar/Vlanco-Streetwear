import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface Product3DProps {
  type: "tshirt" | "mask" | "accessory";
  position: [number, number, number];
  isHovered?: boolean;
}

export const Product3D = ({ type, position, isHovered = false }: Product3DProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      
      if (isHovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const renderProduct = () => {
    switch (type) {
      case "tshirt":
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <boxGeometry args={[1, 1.5, 0.2]} />
              <meshStandardMaterial 
                color="#60a5fa" 
                metalness={0.3} 
                roughness={0.4}
              />
            </mesh>
          </group>
        );
      case "mask":
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.1} 
                roughness={0.8}
              />
            </mesh>
          </group>
        );
      case "accessory":
        return (
          <group position={position}>
            <mesh ref={meshRef}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                metalness={0.7} 
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return renderProduct();
}; 