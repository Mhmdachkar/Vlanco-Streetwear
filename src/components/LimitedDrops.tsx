import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Star,
  Zap,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  Calendar,
  Timer,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Gift,
  Lock,
  Unlock,
  Play,
  Pause,
  Volume2,
  Camera,
  Palette,
  Music,
  MapPin,
  Instagram,
  Twitter,
  Youtube,
  ExternalLink,
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

// Lightweight device capability heuristic
const computePreferPerformance = () => {
  try {
    const dm = (navigator as any).deviceMemory;
    const hc = (navigator as any).hardwareConcurrency;
    const lowMem = typeof dm === 'number' && dm <= 4;
    const lowCpu = typeof hc === 'number' && hc <= 4;
    return lowMem || lowCpu;
  } catch {
    return false;
  }
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsActive(false);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days, color: 'from-purple-500 to-pink-500' },
    { label: 'Hours', value: timeLeft.hours, color: 'from-pink-500 to-cyan-500' },
    { label: 'Minutes', value: timeLeft.minutes, color: 'from-cyan-500 to-blue-500' },
    { label: 'Seconds', value: timeLeft.seconds, color: 'from-blue-500 to-purple-500' }
  ];

  return (
    <div className="flex gap-4 justify-center">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <motion.div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${unit.color} flex items-center justify-center mb-2 shadow-lg`}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
          >
            <span className="text-white font-black text-lg">
              {unit.value.toString().padStart(2, '0')}
            </span>
          </motion.div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// Exclusive Access Badge
const ExclusiveBadge = ({ type, isUnlocked = false }) => {
  const badgeVariants = {
    vip: { icon: Crown, color: 'from-purple-500 to-pink-500', text: 'VIP ACCESS' },
    early: { icon: Clock, color: 'from-cyan-500 to-blue-500', text: 'EARLY ACCESS' },
    member: { icon: Users, color: 'from-blue-500 to-purple-500', text: 'MEMBER ONLY' },
    limited: { icon: Star, color: 'from-pink-500 to-cyan-500', text: 'LIMITED EDITION' }
  };

  const variant = badgeVariants[type] || badgeVariants.limited;
  const IconComponent = variant.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${
        isUnlocked ? 'border-white/30' : 'border-white/10'
      }`}
      animate={isUnlocked ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${variant.color}`} />
      <span className={`text-xs font-bold ${
        isUnlocked ? 'text-white' : 'text-gray-400'
      }`}>
        {variant.text}
      </span>
      {isUnlocked ? (
        <Unlock className="w-3 h-3 text-green-400" />
      ) : (
        <Lock className="w-3 h-3 text-gray-400" />
      )}
    </motion.div>
  );
};

// Small confetti burst (lightweight)
const ConfettiBurst = ({ trigger }: { trigger: number }) => {
  const pieces = 12;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => (
        <motion.span
          key={`${trigger}-${i}`}
          className="absolute w-1 h-1 rounded-sm"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: ['#22d3ee','#a855f7','#ec4899','#3b82f6','#fbbf24'][i % 5]
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: Math.cos((i / pieces) * Math.PI * 2) * 80,
            y: Math.sin((i / pieces) * Math.PI * 2) * 80,
            scale: [1, 1.2, 0.8],
            rotate: 180
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Enhanced Collaboration Card Component
const CollaborationCard = ({ collaboration, index, isInView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  // Subtle 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-50, 50], [6, -6]);
  const ry = useTransform(mx, [-50, 50], [-6, 6]);
  const srx = useSpring(rx, { stiffness: 120, damping: 12 });
  const sry = useSpring(ry, { stiffness: 120, damping: 12 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -10, scale: 1.02 }}
      style={{ rotateX: srx as any, rotateY: sry as any, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
        {/* Background Image/Video */}
        <div className="relative h-64 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${collaboration.image})` }}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-120%' }}
            animate={isHovered ? { x: ['-120%', '120%'] } : { x: '-120%' }}
            transition={{ duration: 1.2, ease: 'ease-out' }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <ExclusiveBadge type={collaboration.accessType} isUnlocked={collaboration.isUnlocked} />
          </div>
          
          {/* Like Button */}
          <motion.button
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleToggleWishlist(collaboration)}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(collaboration.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
          
          {/* Play Button for Videos */}
          {collaboration.type === 'video' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Category and Rarity Badges */}
          <div className="flex items-center gap-2 mb-3">
            <motion.span
              className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30"
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            >
              {collaboration.category}
            </motion.span>
            <motion.span
              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/30"
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            >
              {collaboration.rarity}
            </motion.span>
          </div>

          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                {collaboration.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-400 text-sm">
                  with {collaboration.partner}
                </p>
                {collaboration.artist?.verified && (
                  <motion.div
                    className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              {/* Artist Info */}
              {collaboration.artist && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{collaboration.artist.followers} followers</span>
                  <span>•</span>
                  <span>{collaboration.artist.location}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                {collaboration.price}
              </div>
              <div className="text-xs text-gray-400">
                {collaboration.originalPrice && (
                  <span className="line-through">{collaboration.originalPrice}</span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {collaboration.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{collaboration.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{collaboration.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{collaboration.available}</span>
              </div>
            </div>
            {/* Live marquee */}
            
            {collaboration.status === 'live' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Availability progress */}
          {collaboration.available && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Availability</span>
                <span>{collaboration.available}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, Number(collaboration.available.split('/')[0]) / Number(collaboration.available.split('/')[1]) * 100 || 0)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all relative overflow-hidden ${
                collaboration.isUnlocked
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={collaboration.isUnlocked ? { scale: 1.02 } : {}}
              whileTap={collaboration.isUnlocked ? { scale: 0.98 } : {}}
              disabled={!collaboration.isUnlocked}
              onClick={() => collaboration.isUnlocked && setBurstKey(prev => prev + 1)}
            >
              {collaboration.isUnlocked && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                />
              )}
              <span className="relative z-10">
                {collaboration.isUnlocked ? 'Get Access' : 'Locked'}
              </span>
              <ConfettiBurst trigger={burstKey} />
            </motion.button>
            
            <motion.button
              className="p-3 bg-gray-700 hover:bg-purple-600/20 rounded-lg transition-colors border border-gray-600 hover:border-purple-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        />
      </div>
    </motion.div>
  );
};

// Rarity Color Mapping
const getRarityColors = (rarity: string) => {
  const rarityMap = {
    'MYTHIC': { 
      bg: 'from-purple-900/20 via-pink-900/20 to-purple-900/20',
      border: 'border-purple-500/50',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/25',
      accent: 'from-purple-500 to-pink-500'
    },
    'LEGENDARY': {
      bg: 'from-orange-900/20 via-red-900/20 to-orange-900/20',
      border: 'border-orange-500/50', 
      text: 'text-orange-300',
      glow: 'shadow-orange-500/25',
      accent: 'from-orange-500 to-red-500'
    },
    'EPIC': {
      bg: 'from-blue-900/20 via-cyan-900/20 to-blue-900/20',
      border: 'border-cyan-500/50',
      text: 'text-cyan-300', 
      glow: 'shadow-cyan-500/25',
      accent: 'from-cyan-500 to-blue-500'
    },
    'RARE': {
      bg: 'from-green-900/20 via-emerald-900/20 to-green-900/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/25',
      accent: 'from-emerald-500 to-green-500'
    }
  };
  return rarityMap[rarity] || rarityMap['RARE'];
};

// Power Level Bar Component
const PowerLevelBar = ({ level, isAnimated = false }) => (
  <div className="relative">
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-400">Power Level</span>
      <span className="font-bold text-white">{level}/100</span>
    </div>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: isAnimated ? `${level}%` : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  </div>
);

// Holographic Effect Component
const HolographicOverlay = ({ isHovered }) => (
  <motion.div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    animate={isHovered ? {
      background: [
        'linear-gradient(45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1))',
        'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,255,0,0.1))',
        'linear-gradient(225deg, rgba(255,255,0,0.1), rgba(255,0,255,0.1))',
        'linear-gradient(315deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1))'
      ]
    } : {}}
    transition={{ duration: 2, repeat: Infinity }}
  />
);

// Enhanced Limited Edition Card Component
const LimitedEditionCard = React.memo(({ item, index, isInView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const rarityColors = getRarityColors(item.rarity);
  const preferPerformance = computePreferPerformance();

  // 3D tilt effect
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-100, 100], [8, -8]);
  const ry = useTransform(mx, [-100, 100], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  };

  const availabilityPercentage = (item.availableCount / item.totalCount) * 100;
  const isNearSoldOut = availabilityPercentage < 20;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -15, scale: 1.02 }}
      style={{ rotateX: rx as any, rotateY: ry as any, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
    >
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${rarityColors.bg} backdrop-blur-sm border-2 ${rarityColors.border} shadow-2xl ${rarityColors.glow} transition-all duration-500`}>
        
        {/* Holographic Overlay */}
        <HolographicOverlay isHovered={isHovered} />
        
        {/* Serial Number Badge */}
        <div className="absolute top-4 left-4 z-20">
          <motion.div
            className={`px-3 py-1 bg-gradient-to-r ${rarityColors.accent} rounded-full text-white text-xs font-black`}
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            #{item.serialNumber}
          </motion.div>
        </div>

        {/* Rarity Badge */}
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            className={`px-3 py-1 bg-black/60 backdrop-blur-sm border ${rarityColors.border} rounded-full ${rarityColors.text} text-xs font-bold`}
            animate={isHovered ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {item.rarity}
          </motion.div>
        </div>

        {/* Availability Warning */}
        {isNearSoldOut && (
          <div className="absolute top-16 right-4 z-20">
            <motion.div
              className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-white text-xs font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ALMOST GONE!
            </motion.div>
          </div>
        )}

        {/* Main Image */}
        <div className="relative h-80 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image})` }}
            animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Animated Scan Lines */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
            }}
            animate={isHovered ? { y: ["-100%", "100%"] } : {}}
            transition={{ duration: 2, repeat: preferPerformance ? 0 : Infinity, ease: "linear" }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Power Level Indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <PowerLevelBar level={item.powerLevel} isAnimated={isHovered} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 relative z-10">
          
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <motion.h3 
                className="text-xl font-black text-white mb-1"
                animate={isHovered ? { scale: 1.05 } : {}}
              >
                {item.title}
              </motion.h3>
              <p className={`text-sm ${rarityColors.text} font-medium`}>
                {item.category}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                {item.price}
              </div>
              {item.originalPrice && (
                <div className="text-sm text-gray-400 line-through">
                  {item.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Material */}
          <div className="mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Material:</span>
            <p className="text-white text-sm font-medium">{item.material}</p>
          </div>

          {/* Availability Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Availability</span>
              <span>{item.availableCount}/{item.totalCount} remaining</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${rarityColors.accent} relative`}
                initial={{ width: 0 }}
                animate={{ width: `${availabilityPercentage}%` }}
                transition={{ duration: preferPerformance ? 0.6 : 1, delay: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30"
                  animate={preferPerformance ? undefined : { x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Features Toggle */}
          <motion.button
            className="w-full mb-4 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white text-sm font-medium transition-all"
            onClick={() => setShowFeatures(!showFeatures)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showFeatures ? 'Hide Features' : 'Show Features'} 
            <motion.span
              animate={{ rotate: showFeatures ? 180 : 0 }}
              className="ml-2 inline-block"
            >
              ▼
            </motion.span>
          </motion.button>

          {/* Features List */}
          <AnimatePresence>
            {showFeatures && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  {item.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-xs text-gray-300"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarityColors.accent}`} />
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${
                item.isUnlocked
                  ? `bg-gradient-to-r ${rarityColors.accent} text-white hover:shadow-lg ${rarityColors.glow}`
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={item.isUnlocked ? { scale: 1.02 } : {}}
              whileTap={item.isUnlocked ? { scale: 0.98 } : {}}
              disabled={!item.isUnlocked}
              onClick={() => item.isUnlocked && setBurstKey(prev => prev + 1)}
            >
              {item.isUnlocked && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"
                  initial={{ x: "-120%" }}
                  whileHover={{ x: "120%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {item.isUnlocked ? 'ACQUIRE NOW' : 'LOCKED'}
              </span>
              <ConfettiBurst trigger={burstKey} />
            </motion.button>
            
            <motion.button
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(preferPerformance ? 1 : 3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 bg-gradient-to-r ${rarityColors.accent} rounded-full`}
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={isHovered ? {
                scale: [1, 2, 1],
                opacity: [0.3, 1, 0.3],
                rotate: [0, 180, 360]
              } : {}}
              transition={{
                duration: 2,
                repeat: preferPerformance ? 0 : Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// Main Limited Drops Component
const LimitedDrops = ({ className = "" }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [preferPerformance, setPreferPerformance] = useState<boolean>(() => {
    // Detect low-power/low-end devices quickly
    const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const isLowConcurrency = (navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency <= 4;
    return isLowMemory || isLowConcurrency;
  });
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('limited-edition');
  const [notifications, setNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Enhanced mock data for collaborations and drops with high-res images and realistic dates
  const collaborations = useMemo(() => [
    {
      id: 1,
      title: "VLANCO x KAIROS",
      partner: "KAIROS (Street Artist)",
      description: "Exclusive collection featuring KAIROS's signature graffiti art on premium streetwear. Each piece is hand-signed and numbered. Limited to 500 pieces worldwide.",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop&crop=center&q=80", // Graffiti/Street Art
      type: "collaboration",
      accessType: "vip",
      isUnlocked: true,
      price: "$89",
      originalPrice: "$120",
      views: "12.5K",
      likes: "2.3K",
      available: "127/500",
      status: "live",
      releaseDate: "2024-12-25T18:00:00Z", // Christmas Day 6 PM UTC
      category: "Art",
      rarity: "Ultra Rare",
      artist: {
        name: "KAIROS",
        followers: "45K",
        verified: true,
        location: "Brooklyn, NY"
      }
    },
    {
      id: 2,
      title: "VLANCO x DJ LUNAR",
      partner: "DJ LUNAR (Music Producer)",
      description: "Music-inspired streetwear collection with embedded NFC chips that play exclusive tracks. Only 200 pieces available with unique sound signatures.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&q=80", // Music/DJ Equipment
      type: "collaboration",
      accessType: "early",
      isUnlocked: true,
      price: "$149",
      originalPrice: "$199",
      views: "8.7K",
      likes: "1.8K",
      available: "45/200",
      status: "live",
      releaseDate: "2024-12-28T20:00:00Z", // Dec 28 8 PM UTC
      category: "Music",
      rarity: "Rare",
      artist: {
        name: "DJ LUNAR",
        followers: "120K",
        verified: true,
        location: "Los Angeles, CA"
      }
    },
    {
      id: 3,
      title: "VLANCO x SKATE LEGENDS",
      partner: "Pro Skaters Collective",
      description: "Professional skateboarding-inspired collection with reinforced materials and authentic street cred. Designed by legendary skaters.",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&crop=center&q=80", // Skateboarding
      type: "collaboration",
      accessType: "member",
      isUnlocked: false,
      price: "$79",
      originalPrice: null,
      views: "15.2K",
      likes: "3.1K",
      available: "0/300",
      status: "upcoming",
      releaseDate: "2025-01-15T12:00:00Z", // Jan 15 2025 12 PM UTC
      category: "Sports",
      rarity: "Limited",
      artist: {
        name: "Skate Legends",
        followers: "89K",
        verified: true,
        location: "San Francisco, CA"
      }
    },
    {
      id: 4,
      title: "VLANCO x URBAN PHOTOGRAPHER",
      partner: "Marcus 'Lens' Johnson",
      description: "Photography-inspired collection featuring Marcus's iconic street photography prints on premium fabrics. Each piece tells a story.",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&crop=center&q=80", // Urban Photography
      type: "collaboration",
      accessType: "limited",
      isUnlocked: false,
      price: "$99",
      originalPrice: null,
      views: "6.8K",
      likes: "1.2K",
      available: "0/150",
      status: "upcoming",
      releaseDate: "2025-01-22T15:30:00Z", // Jan 22 2025 3:30 PM UTC
      category: "Photography",
      rarity: "Exclusive",
      artist: {
        name: "Marcus Johnson",
        followers: "67K",
        verified: true,
        location: "Chicago, IL"
      }
    },
    {
      id: 5,
      title: "VLANCO x DIGITAL ARTIST",
      partner: "ZARA (Digital Artist)",
      description: "Futuristic digital art collection with AR integration. Scan your piece to unlock exclusive digital content and experiences.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center&q=80", // Digital Art/Tech
      type: "collaboration",
      accessType: "vip",
      isUnlocked: true,
      price: "$129",
      originalPrice: "$179",
      views: "9.3K",
      likes: "2.1K",
      available: "78/250",
      status: "live",
      releaseDate: "2024-12-30T21:00:00Z", // Dec 30 9 PM UTC
      category: "Digital Art",
      rarity: "Ultra Rare",
      artist: {
        name: "ZARA",
        followers: "156K",
        verified: true,
        location: "Tokyo, Japan"
      }
    },
    {
      id: 6,
      title: "VLANCO x FASHION DESIGNER",
      partner: "ELENA (Fashion Designer)",
      description: "High-fashion meets streetwear in this exclusive collection. Limited pieces with couture-level attention to detail.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center&q=80", // High Fashion
      type: "collaboration",
      accessType: "early",
      isUnlocked: false,
      price: "$199",
      originalPrice: null,
      views: "11.7K",
      likes: "2.8K",
      available: "0/100",
      status: "upcoming",
      releaseDate: "2025-02-14T19:00:00Z", // Valentine's Day 7 PM UTC
      category: "Fashion",
      rarity: "Exclusive",
      artist: {
        name: "ELENA",
        followers: "234K",
        verified: true,
        location: "Paris, France"
      }
    }
  ], []);

  // Wishlist handler
  const handleToggleWishlist = async (collaboration: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isInWishlist(collaboration.id)) {
        await removeFromWishlist(collaboration.id);
      } else {
        await addToWishlist({
          id: collaboration.id,
          name: collaboration.title,
          price: parseFloat(collaboration.price.replace('$', '')) || 0,
          image: collaboration.image,
          category: collaboration.category || 'Limited Drops',
          description: collaboration.description,
          rating: 5,
          reviews: parseInt(collaboration.likes?.replace('K', '000').replace('.', '')) || 0,
          isLimited: true,
          isNew: true,
          colors: ['Limited Edition'],
          sizes: ['One Size']
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const limitedEditionItems = useMemo(() => [
    {
      id: 7,
      title: "PHANTOM GHOST TEE",
      description: "Ultra-rare black tee with invisible UV-reactive print. Only visible under blacklight. Hand-distressed with metallic threads.",
      serialNumber: "001/100",
      price: "$299",
      originalPrice: "$399",
      rarity: "MYTHIC",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&crop=center&q=80",
      category: "Ghost Collection",
      material: "100% Organic Cotton + UV Ink",
      features: ["UV-Reactive", "Hand-Distressed", "Metallic Threading", "Certificate of Authenticity"],
      availableCount: 23,
      totalCount: 100,
      powerLevel: 95,
      isUnlocked: true
    },
    {
      id: 8,
      title: "CYBER MATRIX HOODIE",
      description: "Holographic hoodie with embedded LED strips. Changes patterns based on heartbeat via built-in sensors.",
      serialNumber: "001/50",
      price: "$899",
      originalPrice: "$1299",
      rarity: "LEGENDARY",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&crop=center&q=80",
      category: "Tech Fusion",
      material: "Smart Fabric + LED Technology",
      features: ["Heartbeat Sensor", "LED Animation", "Wireless Charging", "App Control"],
      availableCount: 12,
      totalCount: 50,
      powerLevel: 98,
      isUnlocked: false
    },
    {
      id: 9,
      title: "DRAGON SCALE JACKET",
      description: "Iridescent bomber jacket with scales that shift colors in light. Each scale hand-applied by master craftsmen.",
      serialNumber: "001/75",
      price: "$699",
      originalPrice: "$999",
      rarity: "EPIC",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop&crop=center&q=80",
      category: "Mythical Series",
      material: "Iridescent Polymer Scales",
      features: ["Color-Shifting", "Hand-Applied Scales", "Water Resistant", "Master Crafted"],
      availableCount: 31,
      totalCount: 75,
      powerLevel: 89,
      isUnlocked: true
    },
    {
      id: 10,
      title: "VOID WALKER PANTS",
      description: "Anti-gravity inspired cargo pants with levitating pockets. Magnetic closures and gravity-defying design elements.",
      serialNumber: "001/60",
      price: "$449",
      originalPrice: "$649",
      rarity: "RARE",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop&crop=center&q=80",
      category: "Space Collection",
      material: "Anti-Static Fabric + Magnets",
      features: ["Magnetic Closures", "Levitating Design", "Anti-Static", "Zero-G Inspired"],
      availableCount: 18,
      totalCount: 60,
      powerLevel: 76,
      isUnlocked: true
    },
    {
      id: 11,
      title: "PHOENIX FIRE SNEAKERS",
      description: "Self-heating sneakers with flame-pattern soles that glow red when walking. Temperature-controlled comfort system.",
      serialNumber: "001/40",
      price: "$799",
      originalPrice: "$1199",
      rarity: "LEGENDARY",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&crop=center&q=80",
      category: "Elemental Line",
      material: "Thermogenic Fabric + LED Soles",
      features: ["Self-Heating", "LED Soles", "Temperature Control", "Flame Animation"],
      availableCount: 7,
      totalCount: 40,
      powerLevel: 92,
      isUnlocked: false
    },
    {
      id: 12,
      title: "QUANTUM MASK",
      description: "Reality-bending face mask with holographic projection. Creates digital art displays around your face in AR.",
      serialNumber: "001/25",
      price: "$1299",
      originalPrice: "$1999",
      rarity: "MYTHIC",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&q=80",
      category: "AR Collection",
      material: "Holographic Projectors + Smart Glass",
      features: ["AR Projection", "Face Tracking", "Digital Art Display", "Voice Activation"],
      availableCount: 3,
      totalCount: 25,
      powerLevel: 99,
      isUnlocked: false
    }
  ], []);

  const tabs = [
    { id: 'limited-edition', label: 'Limited Edition', icon: Crown, count: limitedEditionItems.length },
    { id: 'collaborations', label: 'Collaborations', icon: Users, count: collaborations.length },
    { id: 'collectors', label: "Collector's Corner", icon: Award, count: 12 }
  ];

  return (
    <section 
      ref={containerRef}
      className={`relative py-14 sm:py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden ${className}`}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-40 hidden sm:block">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              left: `${5 + i * 18}%`,
              top: `${5 + i * 12}%`,
              background: [
                'linear-gradient(45deg, #8B5CF6, #EC4899)',
                'linear-gradient(135deg, #06B6D4, #3B82F6)',
                'linear-gradient(225deg, #8B5CF6, #06B6D4)',
                'linear-gradient(315deg, #EC4899, #8B5CF6)',
                'linear-gradient(45deg, #3B82F6, #EC4899)'
              ][i]
            }}
            animate={shouldReduceMotion || preferPerformance ? undefined : {
              x: [0, 60, -40, 0],
              y: [0, -40, 60, 0],
              scale: [1, 1.3, 0.7, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + i * 4,
              repeat: preferPerformance ? 0 : Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Subtle top marquee for live drops */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block mb-6"
          >
            <div className="relative overflow-hidden rounded-full border border-white/10">
              <motion.div
                className="whitespace-nowrap py-2 px-4 text-xs text-white/70"
                animate={shouldReduceMotion || preferPerformance ? undefined : { x: ['0%', '-50%'] }}
                transition={{ duration: 12, repeat: preferPerformance ? 0 : Infinity, ease: 'linear' }}
              >
                LIVE NOW • Exclusive Drops • VIP Access • Early Releases • Limited Editions • LIVE NOW • Exclusive Drops • VIP Access • Early Releases • Limited Editions •
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Header Section */}
        <motion.div 
          className="text-center mb-10 sm:mb-12 px-2"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="font-medium bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              EXCLUSIVE DROPS & COLLABORATIONS
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              LIMITED
            </span>
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent ml-4">
              DROPS
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Exclusive collaborations with top artists, limited edition releases, and VIP access to the most coveted pieces in streetwear.
          </motion.p>

          {/* Notification Toggle */}
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                notifications 
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' 
                  : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? (
                <BellRing className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {notifications ? 'Notifications On' : 'Get Notified'}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-10 sm:mb-12 px-2 overflow-x-auto no-scrollbar"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 whitespace-nowrap">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 shrink-0 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                    {tab.count}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'limited-edition' && (
            <motion.div
              key="limited-edition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {limitedEditionItems.map((item, index) => (
                  <LimitedEditionCard
                    key={item.id}
                    item={item}
                    index={index}
                    isInView={isInView}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'collaborations' && (
            <motion.div
              key="collaborations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {collaborations.map((collab, index) => (
                  <CollaborationCard
                    key={collab.id}
                    collaboration={collab}
                    index={index}
                    isInView={isInView}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'collectors' && (
            <motion.div
              key="collectors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
                             <div className="text-center py-16">
                 <motion.div
                   className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                   animate={{ 
                     rotate: [0, 360],
                     scale: [1, 1.1, 1]
                   }}
                   transition={{ 
                     duration: 20, 
                     repeat: Infinity, 
                     ease: "linear",
                     scale: { duration: 3, repeat: Infinity }
                   }}
                 >
                   <Award className="w-12 h-12 text-white" />
                 </motion.div>
                 <h3 className="text-2xl font-bold text-white mb-4">
                   Collector's Corner
                 </h3>
                 <p className="text-gray-400 max-w-md mx-auto mb-8">
                   Exclusive access to rare pieces, limited editions, and collector's items for our most dedicated community members.
                 </p>
                 <motion.button
                   className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-bold shadow-lg hover:shadow-purple-500/25 transition-all"
                   whileHover={{ scale: 1.05, y: -2 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Become a Collector
                 </motion.button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.button
            className="group inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all relative overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: "-120%" }}
              animate={shouldReduceMotion ? undefined : { x: ["-120%", "0%", "120%"] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            
            <span className="relative z-10 flex items-center gap-3">
              <Crown className="w-5 h-5" />
              Join VIP Community
            </span>
          </motion.button>
          
          {/* Stats */}
          <div className="flex justify-center items-center gap-8 mt-8">
            {[
              { icon: Users, label: "VIP Members", value: "2.3K" },
              { icon: Star, label: "Exclusive Drops", value: "47" },
              { icon: Award, label: "Collaborations", value: "12" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                                 <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-2">
                   <stat.icon className="w-5 h-5 text-purple-400" />
                 </div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode="signin"
      />
    </section>
  );
};

export default LimitedDrops;
