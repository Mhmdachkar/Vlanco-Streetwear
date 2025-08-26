import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intensity?: number; // pixels of pull
  children: React.ReactNode;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ intensity = 24, children, className = '', ...props }) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(relX * relX + relY * relY) || 1;
    const pull = Math.min(intensity, dist);
    x.set((relX / dist) * pull);
    y.set((relY / dist) * pull);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;


