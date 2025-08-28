import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Volume2, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Heart, 
  Star,
  Zap,
  Users,
  Trophy,
  Target,
  Rocket,
  Pause,
  RotateCcw,
  Maximize,
  Volume,
  VolumeX,
  MousePointer2,
  Layers3,
  Orbit,
  Cpu,
  Waves,
  ChevronDown,
  Grid,
  Hexagon,
  Camera,
  Music,
  Palette,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  MessageCircle,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';

// Enhanced 3D Tilt Card Component with Physics
const TiltCard = ({ children, className = "", intensity = 15, dampening = 0.8, onMouseEnter, onMouseLeave }) => {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * intensity;
    const rotateX = -((y - centerY) / centerY) * intensity;
    
    setTransform({ rotateX, rotateY, scale: 1.03 });
  }, [intensity]);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onMouseEnter?.();
  }, [onMouseEnter]);
  
  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
    setIsHovered(false);
    onMouseLeave?.();
  }, [onMouseLeave]);
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      animate={transform}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8 
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* 3D Depth Layers */}
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-inherit blur-xl"
              initial={{ opacity: 0, z: -50 }}
              animate={{ opacity: 1, z: -50 }}
              exit={{ opacity: 0 }}
              style={{ transform: 'translateZ(-50px)' }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-blue-500/5 rounded-inherit blur-2xl"
              initial={{ opacity: 0, z: -100 }}
              animate={{ opacity: 1, z: -100 }}
              exit={{ opacity: 0 }}
              style={{ transform: 'translateZ(-100px)' }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Street Culture Particle System with Urban Vibes
const StreetCultureParticleField = ({ count = 60, isActive = false, mousePosition }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = [...Array(count)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 4 + 1,
      life: Math.random() * 100,
      maxLife: 100,
      color: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#3A86FF', '#8338EC'][Math.floor(Math.random() * 6)],
      street: Math.random() > 0.8,
      connectedTo: Math.floor(Math.random() * count)
    }));
    setParticles(newParticles);
  }, [count]);

  const containerRef = useRef();

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          let newVx = particle.vx;
          let newVy = particle.vy;
          
          if (newX <= 0 || newX >= 100) newVx *= -1;
          if (newY <= 0 || newY >= 100) newVy *= -1;
          
          return {
            ...particle,
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY)),
            vx: newVx * 0.99,
            vy: newVy * 0.99,
            life: (particle.life + 1) % particle.maxLife
          };
        })
      );
    }, 60);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: (particle.maxLife - particle.life) / particle.maxLife * 0.8,
            boxShadow: particle.street 
              ? `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}30`
              : `0 0 ${particle.size}px ${particle.color}30`,
            filter: particle.street ? 'brightness(1.5)' : 'brightness(1)'
          }}
          animate={{
            scale: particle.street ? [1, 1.3, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: particle.street ? 2 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Street Culture Border with Dynamic Effects
const StreetCultureBorder = ({ isActive, className = "", variant = "default" }) => {
  const borderVariants = {
    default: `conic-gradient(from 0deg, 
      transparent 0deg,
      #FF6B35 90deg,
      transparent 180deg,
      #3A86FF 270deg,
      transparent 360deg)`,
    graffiti: `conic-gradient(from 0deg,
      #FF6B35 0deg,
      #F7931E 120deg,
      #FFD23F 240deg,
      #FF6B35 360deg)`,
    urban: `linear-gradient(45deg,
      #06FFA5 0%,
      transparent 25%,
      #3A86FF 50%,
      transparent 75%,
      #8338EC 100%)`
  };
  
  return (
    <motion.div
      className={`absolute inset-0 rounded-inherit pointer-events-none ${className}`}
      style={{
        background: borderVariants[variant],
        padding: '2px',
      }}
      animate={isActive ? { 
        rotate: [0, 360],
        scale: [1, 1.01, 1],
      } : { rotate: 0 }}
      transition={{ 
        rotate: { duration: 4, ease: "linear", repeat: Infinity },
        scale: { duration: 2, ease: "easeInOut", repeat: Infinity }
      }}
    >
      <div className="w-full h-full bg-black/90 backdrop-blur-xl rounded-inherit" />
    </motion.div>
  );
};

// Main Street Culture Stories Component
const StreetCultureStories = ({ 
  className = "",
  showParticles = true,
  particleCount = 60,
  title = "STREET CULTURE STORIES",
  subtitle = "Where authentic street culture meets premium design. Discover the real stories behind the movement that defines urban fashion.",
  onExploreClick
}) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeParticles, setActiveParticles] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (isInView && showParticles) {
      setTimeout(() => setActiveParticles(true), 300);
    }
  }, [isInView, showParticles]);

  const streetStories = [
    {
      title: "Graffiti Art Movement",
      description: "From subway tunnels to gallery walls, discover how street art revolutionized urban aesthetics and influenced fashion design",
      icon: Palette,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      bgGradient: "from-orange-900/20 via-red-900/20 to-pink-900/20",
      culture: "graffiti",
      stats: { artists: "10K+", murals: "50K+", influence: "Global" },
      story: "The underground art movement that became mainstream"
    },
    {
      title: "Hip-Hop Culture",
      description: "From the Bronx to the world, explore how hip-hop culture shaped streetwear and became the voice of urban youth", 
      icon: Music,
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      bgGradient: "from-yellow-900/20 via-orange-900/20 to-red-900/20",
      culture: "hiphop",
      stats: { artists: "100K+", tracks: "1M+", global: "Worldwide" },
      story: "The sound that changed everything"
    },
    {
      title: "Skateboard Revolution",
      description: "How skateboarding culture created a new language of style, freedom, and authentic self-expression in fashion",
      icon: TrendingUp,
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      bgGradient: "from-blue-900/20 via-purple-900/20 to-pink-900/20",
      culture: "skate",
      stats: { skaters: "25M+", tricks: "500+", style: "Iconic" },
      story: "Riding the wave of authentic street style"
    },
    {
      title: "Urban Photography",
      description: "Capturing the raw beauty of city life through the lens of street photographers who document real urban culture",
      icon: Camera,
      gradient: "from-green-500 via-teal-500 to-blue-500",
      bgGradient: "from-green-900/20 via-teal-900/20 to-blue-900/20",
      culture: "photography",
      stats: { photos: "1B+", cities: "500+", moments: "Timeless" },
      story: "Framing the authentic urban experience"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className={`relative py-16 px-4 bg-black text-white overflow-hidden ${className}`}
    >
      {/* Street Culture Particle Field */}
      {showParticles && (
        <StreetCultureParticleField 
          count={particleCount} 
          isActive={activeParticles} 
          mousePosition={mousePosition} 
        />
      )}

      {/* Dynamic Urban Gradient Meshes */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${20 + i * 25}%`,
              top: `${15 + i * 20}%`,
              background: [
                'linear-gradient(45deg, #FF6B35, #3A86FF)',
                'linear-gradient(135deg, #F7931E, #06FFA5)',
                'linear-gradient(225deg, #8338EC, #FFD23F)'
              ][i]
            }}
            animate={{
              x: [0, 30, -15, 0],
              y: [0, -15, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 107, 53, 0.1)' }}
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span className="font-medium bg-gradient-to-r from-orange-400 via-red-400 to-blue-400 bg-clip-text text-transparent">
              AUTHENTIC STREET CULTURE
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-black mb-4 leading-tight"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          >
            {title.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block ${
                  i === 0 ? 'bg-gradient-to-r from-white via-orange-200 to-blue-200' :
                  i === 1 ? 'bg-gradient-to-r from-orange-400 via-red-400 to-blue-400' :
                  'bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400'
                } bg-clip-text text-transparent mr-3`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
          
          <motion.p 
            className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Street Stories Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
          {streetStories.map((story, index) => (
            <TiltCard 
              key={index}
              className="group"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="relative h-72 rounded-xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Street Culture Border */}
                <StreetCultureBorder 
                  isActive={hoveredCard === index} 
                  variant={story.culture} 
                />
                
                {/* Background */}
                <div className={`absolute inset-2 rounded-xl bg-gradient-to-br ${story.bgGradient} backdrop-blur-xl`}>
                  
                  {/* Content */}
                  <div className="relative h-full p-5 flex flex-col justify-between z-10">
                    {/* Header */}
                    <div>
                      <motion.div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${story.gradient} flex items-center justify-center mb-3`}
                        animate={hoveredCard === index ? { 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <story.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      
                      <h3 className="text-lg font-bold mb-2 text-white">
                        {story.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-2">
                        {story.description}
                      </p>
                      
                      <motion.p 
                        className="text-xs text-orange-400 font-medium italic"
                        initial={{ opacity: 0 }}
                        animate={hoveredCard === index ? { opacity: 1 } : { opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
                      >
                        "{story.story}"
                      </motion.p>
                    </div>
                    
                    {/* Stats */}
                    <div className="space-y-2">
                      {Object.entries(story.stats).map(([key, value]) => (
                        <motion.div
                          key={key}
                          className="flex justify-between items-center py-1 px-2 bg-white/5 backdrop-blur-sm rounded border border-white/10 text-xs"
                          initial={{ x: -15, opacity: 0 }}
                          animate={hoveredCard === index ? { x: 0, opacity: 1 } : { x: -15, opacity: 0 }}
                          transition={{ delay: Object.keys(story.stats).indexOf(key) * 0.1 }}
                        >
                          <span className="text-gray-400 capitalize font-medium">
                            {key}
                          </span>
                          <span className={`font-bold bg-gradient-to-r ${story.gradient} bg-clip-text text-transparent`}>
                            {value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Hover Action */}
                    <AnimatePresence>
                      {hoveredCard === index && (
                        <motion.div
                          className="absolute bottom-4 right-4"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center`}>
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Interactive Particles per Card */}
                  {hoveredCard === index && showParticles && (
                    <div className="absolute inset-0">
                      <StreetCultureParticleField count={12} isActive={true} mousePosition={mousePosition} />
                    </div>
                  )}
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        {/* Community Spotlight Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
              Community Spotlight
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              Real stories from the streets that inspire our designs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Marcus 'Graff' Johnson",
                role: "Street Artist",
                location: "Brooklyn, NY",
                quote: "Art is the voice of the streets, and fashion is how we wear our truth.",
                avatar: "🎨"
              },
              {
                name: "DJ Luna Rodriguez",
                role: "Hip-Hop Producer",
                location: "Los Angeles, CA",
                quote: "Music and fashion are the same language - they both speak to the soul.",
                avatar: "🎵"
              },
              {
                name: "Alex 'Skate' Chen",
                role: "Professional Skater",
                location: "San Francisco, CA",
                quote: "Every trick is a story, every fall is a lesson, every style is authentic.",
                avatar: "🛹"
              }
            ].map((person, i) => (
              <motion.div
                key={i}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="text-4xl mb-3">{person.avatar}</div>
                <h4 className="font-bold text-white mb-1">{person.name}</h4>
                <p className="text-orange-400 text-sm mb-2">{person.role}</p>
                <p className="text-gray-400 text-xs mb-3 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {person.location}
                </p>
                <p className="text-gray-300 text-sm italic">"{person.quote}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.button
            className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-600 via-red-600 to-blue-600 rounded-lg font-bold text-white relative overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 107, 53, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onExploreClick}
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-orange-600 to-red-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            
            <span className="relative z-10">Join the Movement</span>
            <motion.div
              className="relative z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
          
          {/* Street Culture Stats */}
          <div className="flex justify-center items-center gap-6 mt-6">
            {[
              { icon: Users, label: "Community", value: "2.3M+" },
              { icon: Camera, label: "Stories", value: "847K" },
              { icon: MapPin, label: "Cities", value: "50+" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-1">
                  <stat.icon className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-sm font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StreetCultureStories;