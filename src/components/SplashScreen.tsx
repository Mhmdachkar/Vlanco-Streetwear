import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import splashImage from '@/assets/ChatGPT Image Aug 29, 2025, 03_00_21 AM.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Start the animation sequence with a more refined delay
    const timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationPhase === 1) {
      // Extended active animation phase for smoother experience
      const timer = setTimeout(() => {
        setAnimationPhase(2);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  useEffect(() => {
    if (animationPhase === 2) {
      // Smoother transition completion
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 800);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [animationPhase, onComplete]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Professional easing curves
  const smoothEase = "easeInOut";
  const dramaticEase = "easeOut";
  const elasticEase = "easeOut";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: smoothEase }}
        >
          {/* Enhanced Matrix-style background particles - Responsive */}
          <div className="absolute inset-0">
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 sm:w-1 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -300, 0],
                  x: [0, Math.random() * 120 - 60, 0],
                  scale: [0, 1.2, 0],
                  opacity: [0, 0.9, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 5 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Refined Sound Wave Effect - Responsive */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 sm:w-1 bg-gradient-to-t from-blue-400 to-cyan-400 rounded-full"
                style={{
                  left: `${(i - 12) * 12}px`,
                  height: '15px',
                }}
                animate={{
                  height: animationPhase >= 1 ? [15, 60, 15] : 15,
                  opacity: animationPhase >= 1 ? [0.4, 1, 0.4] : 0.4,
                  scaleY: animationPhase >= 1 ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Desktop Sound Wave Effect */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 hidden sm:block">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 bg-gradient-to-t from-blue-400 to-cyan-400 rounded-full"
                style={{
                  left: `${(i - 12) * 18}px`,
                  height: '20px',
                }}
                animate={{
                  height: animationPhase >= 1 ? [20, 80, 20] : 20,
                  opacity: animationPhase >= 1 ? [0.4, 1, 0.4] : 0.4,
                  scaleY: animationPhase >= 1 ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Enhanced Main splash image container - Responsive */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center px-4 sm:px-0"
            animate={{
              scale: animationPhase >= 1 ? [1, 1.05, 1.1] : 1,
              y: animationPhase >= 2 ? [-30, -100, -200, -400, -600, -800, -1000] : 0,
            }}
            transition={{
              duration: animationPhase >= 1 ? 2.5 : 0,
              ease: animationPhase >= 2 ? dramaticEase : smoothEase,
            }}
          >
            {/* Enhanced Image with sophisticated effects - Responsive */}
            <motion.div
              className="relative"
              animate={{
                rotateY: animationPhase >= 1 ? [0, 2, -2, 0] : 0,
                rotateX: animationPhase >= 1 ? [0, 1, -1, 0] : 0,
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <motion.img
                src={splashImage}
                alt="VLANCO Store"
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[60vh] sm:max-h-[70vh] md:max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))',
                }}
                initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
                animate={{
                  opacity: imageLoaded ? 1 : 0,
                  scale: imageLoaded ? 1 : 0.7,
                  rotateY: imageLoaded ? 0 : -15,
                }}
                transition={{
                  duration: 1.5,
                  ease: elasticEase,
                }}
                onLoad={handleImageLoad}
              />

              {/* Enhanced Glowing border effect - Responsive */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl"
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                  backgroundSize: '400% 400%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  opacity: animationPhase >= 1 ? 0.4 : 0,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                initial={{ opacity: 0 }}
              />

              {/* Enhanced Shimmer effect - Responsive */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: animationPhase >= 1 ? ['-100%', '100%'] : '-100%',
                }}
                transition={{
                  duration: 2,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Enhanced Pulse effect - Responsive */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-blue-500/60"
                animate={{
                  scale: animationPhase >= 1 ? [1, 1.03, 1] : 1,
                  opacity: animationPhase >= 1 ? [0.6, 0.9, 0.6] : 0.6,
                }}
                transition={{
                  duration: 2.5,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Additional glow layers - Responsive */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl border border-cyan-400/40"
                animate={{
                  scale: animationPhase >= 1 ? [1, 1.05, 1] : 1,
                  opacity: animationPhase >= 1 ? [0.3, 0.6, 0.3] : 0.3,
                }}
                transition={{
                  duration: 3,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Enhanced Floating text overlay - Responsive */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 px-4"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                y: imageLoaded ? 0 : 30,
                scale: imageLoaded ? 1 : 0.9,
              }}
              transition={{ duration: 1.8, delay: 0.8, ease: elasticEase }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-2 sm:mb-4 tracking-wider"
                style={{
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  scale: animationPhase >= 1 ? [1, 1.05, 1] : 1,
                  textShadow: animationPhase >= 1 ? [
                    '0 0 20px rgba(59, 130, 246, 0.8)',
                    '0 0 40px rgba(59, 130, 246, 1)',
                    '0 0 20px rgba(59, 130, 246, 0.8)'
                  ] : '0 0 20px rgba(59, 130, 246, 0.8)',
                }}
                transition={{
                  duration: 3,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                VLANCO
              </motion.h1>
              
              <motion.p
                className="text-sm sm:text-lg md:text-xl lg:text-2xl text-blue-300 font-light tracking-wide"
                animate={{
                  opacity: animationPhase >= 1 ? [1, 0.7, 1] : 1,
                  y: animationPhase >= 1 ? [0, -5, 0] : 0,
                }}
                transition={{
                  duration: 2.5,
                  repeat: animationPhase >= 1 ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                STREETWEAR VERSE
              </motion.p>
            </motion.div>

            {/* Enhanced Loading indicator - Responsive */}
            <motion.div
              className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 0.8,
              }}
              transition={{ duration: 1, delay: 1.2, ease: smoothEase }}
            >
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Transition overlay */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{
              opacity: animationPhase >= 2 ? [0, 0.2, 0.5, 0.8, 1] : 0,
            }}
            transition={{
              duration: 2,
              ease: dramaticEase,
            }}
          />

          {/* Enhanced Energy Wave Effects - Responsive */}
          {animationPhase >= 1 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border border-blue-500/30 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1.6, 2, 2.5],
                    opacity: [0.6, 0.4, 0.3, 0.2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Enhanced Corner Glow Effects - Responsive */}
          <motion.div
            className="absolute top-0 left-0 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500/30 to-transparent rounded-full"
            animate={{
              scale: animationPhase >= 1 ? [1, 1.3, 1] : 1,
              opacity: animationPhase >= 1 ? [0.4, 0.7, 0.4] : 0.4,
            }}
            transition={{
              duration: 3,
              repeat: animationPhase >= 1 ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-bl from-purple-500/30 to-transparent rounded-full"
            animate={{
              scale: animationPhase >= 1 ? [1, 1.3, 1] : 1,
              opacity: animationPhase >= 1 ? [0.4, 0.7, 0.4] : 0.4,
            }}
            transition={{
              duration: 3,
              repeat: animationPhase >= 1 ? Infinity : 0,
              delay: 0.8,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-tr from-cyan-500/30 to-transparent rounded-full"
            animate={{
              scale: animationPhase >= 1 ? [1, 1.3, 1] : 1,
              opacity: animationPhase >= 1 ? [0.4, 0.7, 0.4] : 0.4,
            }}
            transition={{
              duration: 3,
              repeat: animationPhase >= 1 ? Infinity : 0,
              delay: 1.6,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-20 h-20 sm:w-40 sm:h-40 bg-gradient-to-tl from-blue-500/30 to-transparent rounded-full"
            animate={{
              scale: animationPhase >= 1 ? [1, 1.3, 1] : 1,
              opacity: animationPhase >= 1 ? [0.4, 0.7, 0.4] : 0.4,
            }}
            transition={{
              duration: 3,
              repeat: animationPhase >= 1 ? Infinity : 0,
              delay: 2.4,
              ease: "easeInOut",
            }}
          />

          {/* Floating geometric elements for added sophistication - Responsive */}
          {animationPhase >= 1 && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-cyan-400/60 rounded-full"
                  style={{
                    left: `${20 + (i % 4) * 20}%`,
                    top: `${20 + Math.floor(i / 4) * 20}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
