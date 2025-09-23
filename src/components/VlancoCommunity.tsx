import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Users, 
  Heart,
  Star,
  Camera,
  Share2,
  MessageCircle,
  ThumbsUp,
  Award,
  Trophy,
  Crown,
  Sparkles,
  Zap,
  Eye,
  MapPin,
  Calendar,
  Clock,
  Play,
  Pause,
  Volume2,
  Instagram,
  Twitter,
  Youtube,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Tag,
  User,
  UserPlus,
  UserCheck,
  TrendingUp,
  Target,
  Gift,
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info,
  Quote
} from 'lucide-react';

// Load VLANCO gallery images and provide a shared 3s tick
const useVlancoGallery = () => {
  const images = useMemo(() => {
    try {
      const modules = import.meta.glob('@/assets/vlanco-gallery/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' }) as Record<string, string>;
      // Stable ordering
      return Object.entries(modules)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, src]) => src);
    } catch {
      return [] as string[];
    }
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return { images, tick } as const;
};

// Floating Community Particles Component
const CommunityParticles = ({ isInView }) => {
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      color: ['#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 4)]
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          animate={isInView ? {
            y: [0, -30, 0],
            x: [0, 15, -10, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Customer Spotlight Card Component
const CustomerSpotlight = ({ customer, index, isInView, rotatingImage }: { customer: any; index: number; isInView: boolean; rotatingImage?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
		{/* Customer Image */}
        <div className="relative h-64 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${rotatingImage || customer.image})` }}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Customer Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden"
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              >
                <img 
                  src={customer.avatar} 
                  alt={customer.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div>
                <h4 className="text-white font-bold text-sm">{customer.name}</h4>
                <p className="text-gray-300 text-xs">{customer.location}</p>
              </div>
            </div>
          </div>
          
          {/* Like Button */}
          <motion.button
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {customer.spotlightTitle}
              </h3>
              <p className="text-gray-400 text-sm">
                Wearing {customer.wearingItem}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < customer.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                />
              ))}
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            "{customer.testimonial}"
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{customer.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{customer.comments}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">{customer.shares}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
              <Crown className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">VIP</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-bold text-sm transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Follow
            </motion.button>
            
            <motion.button
              className="p-2 bg-gray-700 hover:bg-purple-600/20 rounded-lg transition-colors border border-gray-600 hover:border-purple-500/50"
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
        />
      </div>
    </motion.div>
  );
};

// User Generated Content Gallery Component
const UGCGallery = ({ content, index, isInView, rotatingImage }: { content: any; index: number; isInView: boolean; rotatingImage?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 120,
        damping: 20
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, rotateY: 5 }}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10">
		{/* Content Image/Video */}
        <div className="relative aspect-square overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${rotatingImage || content.media})` }}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play Button for Videos */}
          {content.type === 'video' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Play className="w-5 h-5 text-white ml-1" />
              </div>
            </motion.div>
          )}
          
          {/* User Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden">
                <img 
                  src={content.userAvatar} 
                  alt={content.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">{content.username}</p>
                <p className="text-gray-300 text-xs">{content.location}</p>
              </div>
            </div>
          </div>
          
          {/* Like Button */}
          <motion.button
            className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
        </div>
        
        {/* Content Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">{content.hashtag}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{content.likes}</span>
            </div>
          </div>
          
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
            {content.caption}
          </p>
        </div>
        
        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        />
      </div>
    </motion.div>
  );
};

// Community Challenge Card Component
const CommunityChallenge = ({ challenge, index, isInView }) => {
  const [isParticipating, setIsParticipating] = useState(false);

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
        {/* Challenge Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
              <p className="text-gray-400 text-sm">{challenge.duration}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-black text-purple-400">{challenge.prize}</div>
            <div className="text-xs text-gray-400">Prize</div>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {challenge.description}
        </p>
        
        {/* Challenge Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{challenge.participants} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{challenge.timeLeft}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">ACTIVE</span>
          </div>
        </div>
        
        {/* Action Button */}
        <motion.button
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all ${
            isParticipating
              ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white'
              : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsParticipating(!isParticipating)}
        >
          {isParticipating ? 'Participating' : 'Join Challenge'}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main VLANCO Community Component
const VlancoCommunity = ({ className = "" }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const { images: vlancoImages, tick } = useVlancoGallery();
  
  const [activeTab, setActiveTab] = useState('spotlights');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Mock data for customer spotlights
  const customerSpotlights = useMemo(() => [
    {
      id: 1,
      name: "Marcus Johnson",
      location: "Brooklyn, NY",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&q=80",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center&q=80",
      spotlightTitle: "Street Style King",
      wearingItem: "VLANCO x KAIROS Hoodie",
      testimonial: "This hoodie is absolutely incredible! The quality is unmatched and the design is pure art. I get compliments everywhere I go.",
      rating: 5,
      likes: "2.3K",
      comments: "156",
      shares: "89"
    },
    {
      id: 2,
      name: "Luna Rodriguez",
      location: "Los Angeles, CA",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face&q=80",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=600&fit=crop&crop=center&q=80",
      spotlightTitle: "Fashion Influencer",
      wearingItem: "VLANCO Tech Drop Jacket",
      testimonial: "The tech features in this jacket are mind-blowing! Temperature control and LED accents make me feel like I'm from the future.",
      rating: 5,
      likes: "4.7K",
      comments: "234",
      shares: "156"
    },
    {
      id: 3,
      name: "Alex Chen",
      location: "San Francisco, CA",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&q=80",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop&crop=center&q=80",
      spotlightTitle: "Skateboard Pro",
      wearingItem: "VLANCO x SKATE LEGENDS Tee",
      testimonial: "Perfect for skating! The reinforced materials can handle anything. This is now my go-to gear for competitions.",
      rating: 5,
      likes: "1.8K",
      comments: "98",
      shares: "67"
    },
    {
      id: 4,
      name: "Zara Kim",
      location: "Tokyo, Japan",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&q=80",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop&crop=center&q=80",
      spotlightTitle: "Digital Artist",
      wearingItem: "VLANCO x DIGITAL ARTIST Collection",
      testimonial: "The AR integration is incredible! I can showcase my digital art through the clothing. It's like wearing a gallery.",
      rating: 5,
      likes: "3.2K",
      comments: "189",
      shares: "124"
    }
  ], []);

  // Mock data for user-generated content
  const ugcContent = useMemo(() => [
    {
      id: 1,
      username: "@streetstyle_marcus",
      location: "Brooklyn",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center&q=80",
      type: "image",
      hashtag: "#VLANCOxKAIROS",
      caption: "Rocking the new KAIROS collab! This graffiti art is absolutely stunning 🔥",
      likes: "2.3K"
    },
    {
      id: 2,
      username: "@luna_fashion",
      location: "LA",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=center&q=80",
      type: "video",
      hashtag: "#VLANCOTech",
      caption: "The LED features on this jacket are insane! Perfect for night shoots ✨",
      likes: "4.7K"
    },
    {
      id: 3,
      username: "@alex_skates",
      location: "SF",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=center&q=80",
      type: "image",
      hashtag: "#VLANCOSkate",
      caption: "Skate session in the new SKATE LEGENDS gear. Built to last! 🛹",
      likes: "1.8K"
    },
    {
      id: 4,
      username: "@zara_digital",
      location: "Tokyo",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=center&q=80",
      type: "image",
      hashtag: "#VLANCODigital",
      caption: "AR art showcase with the new digital collection. The future is here! 🎨",
      likes: "3.2K"
    },
    {
      id: 5,
      username: "@street_photographer",
      location: "Chicago",
      userAvatar: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&crop=center&q=80",
      type: "image",
      hashtag: "#VLANCOUrban",
      caption: "Street photography session in the urban collection. Perfect for city vibes 📸",
      likes: "2.1K"
    },
    {
      id: 6,
      username: "@fashion_elena",
      location: "Paris",
      userAvatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=50&h=50&fit=crop&crop=face&q=80",
      media: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center&q=80",
      type: "video",
      hashtag: "#VLANCOFashion",
      caption: "High-fashion meets streetwear. This collection is pure elegance! 👗",
      likes: "5.1K"
    }
  ], []);

  // Mock data for community challenges
  const communityChallenges = useMemo(() => [
    {
      id: 1,
      title: "Street Style Challenge",
      description: "Show us your best street style using VLANCO pieces. Most creative outfit wins!",
      duration: "7 days left",
      prize: "$500",
      participants: "1.2K",
      timeLeft: "6 days",
      status: "active"
    },
    {
      id: 2,
      title: "Photography Contest",
      description: "Capture the essence of street culture in your VLANCO gear. Best photo gets featured!",
      duration: "5 days left",
      prize: "$300",
      participants: "856",
      timeLeft: "4 days",
      status: "active"
    },
    {
      id: 3,
      title: "Video Creation",
      description: "Create a 30-second video showcasing your VLANCO style. Most engaging wins!",
      duration: "3 days left",
      prize: "$750",
      participants: "2.1K",
      timeLeft: "2 days",
      status: "active"
    }
  ], []);

  // Mock data for testimonials
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "Sarah Williams",
      role: "Fashion Blogger",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face&q=80",
      text: "VLANCO has completely transformed my wardrobe. The quality is exceptional and the designs are always ahead of the curve.",
      rating: 5
    },
    {
      id: 2,
      name: "Mike Thompson",
      role: "Street Artist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&q=80",
      text: "The KAIROS collaboration is a masterpiece. Finally, street art gets the recognition it deserves in fashion.",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Davis",
      role: "Tech Enthusiast",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face&q=80",
      text: "The tech integration in VLANCO pieces is revolutionary. I feel like I'm wearing the future!",
      rating: 5
    }
  ], []);

  const tabs = [
    { id: 'spotlights', label: 'Customer Spotlights', icon: Star, count: customerSpotlights.length },
    { id: 'ugc', label: 'User Content', icon: Camera, count: ugcContent.length },
    { id: 'challenges', label: 'Challenges', icon: Trophy, count: communityChallenges.length },
    { id: 'testimonials', label: 'Reviews', icon: Quote, count: testimonials.length }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section 
      ref={containerRef}
      className={`relative py-14 sm:py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden ${className}`}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-40 hidden sm:block">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${120 + i * 60}px`,
              height: `${120 + i * 60}px`,
              left: `${5 + i * 15}%`,
              top: `${5 + i * 10}%`,
              background: [
                'linear-gradient(45deg, #8B5CF6, #EC4899)',
                'linear-gradient(135deg, #06B6D4, #3B82F6)',
                'linear-gradient(225deg, #8B5CF6, #06B6D4)',
                'linear-gradient(315deg, #EC4899, #8B5CF6)',
                'linear-gradient(45deg, #3B82F6, #EC4899)',
                'linear-gradient(135deg, #8B5CF6, #3B82F6)'
              ][i]
            }}
            animate={shouldReduceMotion ? undefined : {
              x: [0, 80, -60, 0],
              y: [0, -60, 80, 0],
              scale: [1, 1.4, 0.6, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 25 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Community Particles (hidden on mobile) */}
      <div className="hidden sm:block">
        <CommunityParticles isInView={isInView} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
            <Users className="w-4 h-4 text-purple-400" />
            <span className="font-medium bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              VLANCO COMMUNITY
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              JOIN THE
            </span>
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent ml-4">
              MOVEMENT
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Connect with fellow streetwear enthusiasts, share your style, and be part of the most vibrant fashion community.
          </motion.p>

          {/* Social Media Integration */}
          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { icon: Instagram, label: "Instagram", color: "from-pink-500 to-purple-500" },
              { icon: Twitter, label: "Twitter", color: "from-blue-400 to-cyan-400" },
              { icon: Youtube, label: "YouTube", color: "from-red-500 to-pink-500" }
            ].map((social, i) => (
              <motion.button
                key={i}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${social.color} text-white rounded-full font-medium text-sm`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-4 h-4" />
                {social.label}
              </motion.button>
            ))}
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
          {activeTab === 'spotlights' && (
            <motion.div
              key="spotlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {customerSpotlights.map((customer, index) => (
                  <CustomerSpotlight
                    key={customer.id}
                    customer={customer}
                    index={index}
                    isInView={isInView}
                    rotatingImage={vlancoImages.length ? vlancoImages[(tick + index) % vlancoImages.length] : undefined}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ugc' && (
            <motion.div
              key="ugc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {ugcContent.map((content, index) => (
                  <UGCGallery
                    key={content.id}
                    content={content}
                    index={index}
                    isInView={isInView}
                    rotatingImage={vlancoImages.length ? vlancoImages[(tick + index) % vlancoImages.length] : undefined}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {communityChallenges.map((challenge, index) => (
                  <CommunityChallenge
                    key={challenge.id}
                    challenge={challenge}
                    index={index}
                    isInView={isInView}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'testimonials' && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-4xl mx-auto">
                <motion.div
                  className="relative p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                                     <Quote className="w-8 h-8 text-purple-400 mb-4" />
                  
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonials[currentTestimonial].avatar} 
                      alt={testimonials[currentTestimonial].name}
                      className="w-12 h-12 rounded-full border-2 border-purple-400/30"
                    />
                    <div>
                      <h4 className="text-white font-bold">{testimonials[currentTestimonial].name}</h4>
                      <p className="text-gray-400 text-sm">{testimonials[currentTestimonial].role}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-yellow-400 fill-yellow-400" 
                        />
                      ))}
                    </div>
                  </div>
                  
                                     <Quote className="w-8 h-8 text-purple-400 absolute top-4 right-4 rotate-180" />
                </motion.div>
                
                {/* Testimonial Navigation */}
                <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                  {testimonials.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentTestimonial ? 'bg-purple-400' : 'bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.button
            className="group inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-cyan-600 to-pink-600 text-white rounded-full font-bold text-base sm:text-lg shadow-2xl hover:shadow-purple-500/25 transition-all relative overflow-hidden"
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
              <Users className="w-5 h-5" />
              Join the Community
            </span>
          </motion.button>
          
          {/* Community Stats */}
          <div className="flex justify-center items-center gap-8 mt-8">
            {[
              { icon: Users, label: "Community Members", value: "25.3K" },
              { icon: Camera, label: "Photos Shared", value: "12.7K" },
              { icon: Trophy, label: "Challenges Won", value: "1.2K" }
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
    </section>
  );
};

export default VlancoCommunity;
