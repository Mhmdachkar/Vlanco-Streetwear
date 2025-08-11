import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
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
  Rocket
} from 'lucide-react';

const BrandExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Memoize random values to prevent recalculation on every render
  const backgroundParticles = useMemo(() => 
    [...Array(25)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    })), []
  );

  const experiences = [
    {
      title: "Street Culture",
      description: "Born from the streets, crafted for authenticity",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Premium Quality",
      description: "Uncompromising materials and craftsmanship", 
      icon: Trophy,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50"
    },
    {
      title: "Future Vision",
      description: "Pioneering the next generation of fashion",
      icon: Rocket,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      title: "Global Impact",
      description: "Making waves in streetwear worldwide",
      icon: Target,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  return (
    <section 
      id="brand-experience"
      ref={containerRef}
      className="py-20 px-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        {backgroundParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Animated Grid Background */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">
              BRAND EXPERIENCE
            </h2>
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
          
          <motion.p 
            className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Immerse yourself in the VLANCO universe where every detail is crafted 
            to deliver an extraordinary streetwear experience.
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          
          {/* Left: Video Experience */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div 
              className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border border-primary/30 group cursor-pointer"
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setIsVideoHovered(true)}
              onHoverEnd={() => setIsVideoHovered(false)}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="/vlanco-brand-experience.mp4"
                poster="/brand-experience-poster.jpg"
                muted={isMuted}
                controls={false}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
                style={{ display: isVideoPlaying ? 'block' : 'none' }}
              />
              {/* Overlay */}
              {!isVideoPlaying && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center z-10">
                  <motion.div
                    className="text-center text-white"
                    animate={isVideoHovered ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm cursor-pointer"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      onClick={() => {
                        setIsVideoPlaying(true);
                        videoRef.current?.play();
                      }}
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">VLANCO Experience</h3>
                    <p className="text-white/80">Watch our brand story unfold</p>
                  </motion.div>
                </div>
              )}
              {/* Floating Particles */}
              {isVideoHovered && !isVideoPlaying && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{ 
                        opacity: 0,
                        x: `${50 + Math.random() * 50}%`,
                        y: `${50 + Math.random() * 50}%`,
                        scale: 0
                      }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
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
              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 flex gap-3 z-20">
                <motion.button
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle volume"
                  onClick={() => setIsMuted((m) => !m)}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Share video"
                  onClick={() => { navigator.share?.({ title: 'VLANCO Experience', url: window.location.href }); }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
              {/* 3D Shadow */}
              <div className="absolute inset-0 bg-black/20 transform translate-y-2 -z-10 rounded-3xl blur-xl" />
            </motion.div>
          </motion.div>

          {/* Right: Experience Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {experiences.map((experience, index) => {
              const IconComponent = experience.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <motion.div
                  key={index}
                  className={`group relative p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${experience.bgGradient} backdrop-blur-sm cursor-pointer overflow-hidden`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1 + index * 0.2 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  {/* Floating particles for hovered card */}
                  {isHovered && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-primary rounded-full"
                          initial={{ 
                            opacity: 0,
                            x: `${50 + Math.random() * 50}%`,
                            y: `${50 + Math.random() * 50}%`,
                            scale: 0
                          }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            scale: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </>
                  )}

                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`p-3 rounded-xl bg-gradient-to-br ${experience.gradient} text-white shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 360,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {experience.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {experience.description}
                      </p>
                    </div>

                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 5 }}
                    >
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${experience.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl -z-10`}
                    animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {[
            { number: "10M+", label: "Social Reach", icon: Heart },
            { number: "50K+", label: "Community", icon: Users },
            { number: "500+", label: "Designs", icon: Sparkles },
            { number: "4.9", label: "Rating", icon: Star }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-background to-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2 + index * 0.1 }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-3 text-purple-400 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-6 h-6 text-purple-400 fill-purple-400" />
              </motion.div>
              
              <motion.h3 
                className="text-3xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-1"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 2.2 + index * 0.1, type: "spring" }}
              >
                {stat.number}
              </motion.h3>
              
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 2.5 }}
        >
          <motion.div
            className="inline-flex flex-col sm:flex-row gap-4 items-center"
            initial={{ scale: 0.8 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 2.7, type: "spring" }}
          >
            <motion.button
              className="px-10 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-primary/25 transition-all relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Join the VLANCO experience"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
              />
              
              <span className="relative z-10 flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Join the Experience
              </span>
            </motion.button>

            <motion.button
              className="px-10 py-4 border-2 border-foreground/20 text-foreground rounded-full font-bold text-lg hover:border-primary hover:text-primary transition-all backdrop-blur-sm bg-background/50"
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                backgroundColor: "rgba(139, 92, 246, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share the VLANCO vision"
            >
              <span className="flex items-center gap-3">
                <Share2 className="w-5 h-5" />
                Share the Vision
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        />
      </div>
    </section>
  );
};

export default BrandExperience;