import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";
import OptimizedImage from "./OptimizedImage";

interface LandingPageProps {
  onEnter: () => void;
}

// Glitch Text Component
const GlitchText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
        animate={glitchActive ? {
          x: [0, -2, 2, -1, 1, 0],
          y: [0, 1, -1, 0, 0, 0],
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
      
      {/* Glitch layers */}
      {glitchActive && (
        <>
          <motion.span
            className="absolute top-0 left-0 text-xl md:text-2xl font-light tracking-wide text-red-500"
            animate={{
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 1, -1, 0, 0, 0],
            }}
            transition={{ duration: 0.2 }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute top-0 left-0 text-xl md:text-2xl font-light tracking-wide text-cyan-500"
            animate={{
              x: [0, 2, -2, 1, -1, 0],
              y: [0, -1, 1, 0, 0, 0],
            }}
            transition={{ duration: 0.2 }}
          >
            {text}
          </motion.span>
        </>
      )}
    </div>
  );
};

// Typewriter Text Component
const TypewriterText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="ml-1"
      >
        |
      </motion.span>
    </span>
  );
};

// Prominent VLANCO Logo Component
const ProminentLogo = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 30;
        const y = (e.clientY - rect.top - rect.height / 2) / 30;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={logoRef}
      className="relative perspective-1000 mb-8"
      animate={{
        rotateX: mousePosition.y,
        rotateY: mousePosition.x,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      <div className="relative">
        {/* Main VLANCO Text */}
        <motion.h1 
          className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white relative z-10 text-center"
          style={{
            textShadow: `
              0 0 20px rgba(59, 130, 246, 0.8),
              0 0 40px rgba(59, 130, 246, 0.6),
              0 0 60px rgba(59, 130, 246, 0.4),
              0 0 80px rgba(59, 130, 246, 0.2),
              0 0 100px rgba(59, 130, 246, 0.1)
            `,
            transformStyle: "preserve-3d",
          }}
        >
          VLANCO
        </motion.h1>
        
        {/* 3D Depth Layers */}
        {[...Array(8)].map((_, i) => (
          <motion.h1
            key={i}
            className="absolute text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-blue-500/30 text-center"
            style={{
              top: 0,
              left: 0,
              right: 0,
              zIndex: -i - 1,
              transform: `translateZ(${-i * 8}px)`,
            }}
          >
            VLANCO
          </motion.h1>
        ))}
        
        {/* Glowing border effect */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-500/20 rounded-lg"
          style={{
            top: "-20px",
            left: "-20px",
            right: "-20px",
            bottom: "-20px",
            zIndex: -10,
          }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(59, 130, 246, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};

export const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated Background Overlay */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ y: springY }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <OptimizedImage
          src={heroImage}
          alt="VLANCO Hero Background"
          className="w-full h-full object-cover"
          priority={true} // Hero image should load immediately
          lazy={false}
          sizes="100vw"
        />
      </motion.div>
      
      {/* Dynamic Gradient Overlay */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
            linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))
          `,
        }}
        animate={{
          background: [
            `
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))
            `,
            `
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))
            `,
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Prominent VLANCO Logo - Always Visible */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.5 }}
          animate={isLoaded ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <ProminentLogo />
          
          {/* Glitch Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-6"
          >
            <GlitchText text="STREETWEAR REDEFINED" />
          </motion.div>
        </motion.div>

        {/* Typewriter Tagline */}
        <motion.div
          className="text-center mb-12 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            <TypewriterText text="Where Street Culture Meets Innovation" />
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Discover the future of streetwear with our premium collection of 
            cutting-edge designs, sustainable materials, and unparalleled style.
          </p>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          className="grid grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.5 }}
        >
          {[
            { number: "10M+", label: "Social Reach" },
            { number: "50K+", label: "Community" },
            { number: "500+", label: "Designs" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.1, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="text-2xl font-black text-white mb-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                {stat.number}
              </motion.div>
              <p className="text-sm text-white/60 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Enter Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isLoaded ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 3, ease: "easeOut" }}
          className="relative mb-16"
        >
          <Button
            onClick={onEnter}
            className="relative text-lg px-16 py-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden group"
            size="lg"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
            />
            
            {/* Floating particles around button */}
            {isHovering && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    initial={{ 
                      opacity: 0,
                      x: "50%",
                      y: "50%",
                      scale: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      x: `${Math.random() * 300 - 150}px`,
                      y: `${Math.random() * 300 - 150}px`,
                      scale: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </>
            )}
            
            <motion.span
              className="relative z-10 font-bold tracking-wider"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ENTER STORE
            </motion.span>
          </Button>
        </motion.div>

        {/* Enhanced Scroll Indicator - Now positioned below the button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 3.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-blue-500 rounded-full flex justify-center relative"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-blue-500 rounded-full mt-2"
            />
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage; 