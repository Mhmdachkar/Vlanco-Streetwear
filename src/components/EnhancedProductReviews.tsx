import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Camera, 
  Video, 
  Filter, 
  SortDesc, 
  User, 
  Verified, 
  Heart,
  MessageCircle,
  Share2,
  ChevronDown,
  Image as ImageIcon,
  Play
} from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  size: string;
  color: string;
  fit: 'too_small' | 'perfect' | 'too_large';
  quality: number;
  comfort: number;
  style: number;
  photos?: string[];
  videos?: string[];
  helpfulCount: number;
  unhelpfulCount: number;
  replies?: ReviewReply[];
  tags?: string[];
}

interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  isOwner?: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  fitDistribution: {
    too_small: number;
    perfect: number;
    too_large: number;
  };
  recommendationPercentage: number;
}

interface EnhancedProductReviewsProps {
  productId: string;
}

const EnhancedProductReviews: React.FC<EnhancedProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  // Mock data - would come from API
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Alex Chen',
          userAvatar: '/avatars/user1.jpg',
          rating: 5,
          title: 'Absolutely perfect quality and fit!',
          content: 'This hoodie exceeded my expectations. The fabric is premium, the fit is exactly what I wanted, and the design is fire. Will definitely be ordering more from VLANCO.',
          date: '2024-01-15',
          verified: true,
          size: 'M',
          color: 'Black',
          fit: 'perfect',
          quality: 5,
          comfort: 5,
          style: 5,
          photos: ['/src/assets/ChatGPT Image Aug 29, 2025, 03_00_21 AM.png', '/src/assets/1.png'],
          videos: ['/reviews/video1.mp4'],
          helpfulCount: 28,
          unhelpfulCount: 2,
          tags: ['high-quality', 'true-to-size', 'comfortable'],
          replies: [
            {
              id: 'reply1',
              userId: 'vlanco',
              userName: 'VLANCO Team',
              content: 'Thank you for the amazing review! We\'re thrilled you love the hoodie.',
              date: '2024-01-16',
              isOwner: true
            }
          ]
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Maya Rodriguez',
          userAvatar: '/avatars/user2.jpg',
          rating: 4,
          title: 'Great quality, runs slightly large',
          content: 'Love the material and design. The only thing is it runs a bit larger than expected, but still looks great. The oversized fit actually works well for the streetwear aesthetic.',
          date: '2024-01-10',
          verified: true,
          size: 'S',
          color: 'White',
          fit: 'too_large',
          quality: 5,
          comfort: 4,
          style: 5,
          photos: ['/reviews/photo3.jpg'],
          helpfulCount: 15,
          unhelpfulCount: 1,
          tags: ['runs-large', 'great-material', 'oversized-fit']
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Jordan Kim',
          rating: 5,
          title: 'My new favorite piece',
          content: 'This is hands down the best streetwear purchase I\'ve made this year. The attention to detail is incredible and it pairs well with everything in my wardrobe.',
          date: '2024-01-08',
          verified: false,
          size: 'L',
          color: 'Black',
          fit: 'perfect',
          quality: 5,
          comfort: 5,
          style: 5,
          helpfulCount: 22,
          unhelpfulCount: 0,
          tags: ['versatile', 'attention-to-detail']
        }
      ];

      const mockStats: ReviewStats = {
        averageRating: 4.7,
        totalReviews: 156,
        ratingDistribution: {
          5: 98,
          4: 35,
          3: 15,
          2: 5,
          1: 3
        },
        fitDistribution: {
          too_small: 8,
          perfect: 78,
          too_large: 14
        },
        recommendationPercentage: 94
      };

      setReviews(mockReviews);
      setReviewStats(mockStats);
      setLoading(false);
    };

    loadReviews();
  }, [productId]);

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'with-photos') return review.photos && review.photos.length > 0;
      if (selectedFilter === 'with-videos') return review.videos && review.videos.length > 0;
      if (selectedFilter === 'verified') return review.verified;
      if (selectedFilter.startsWith('rating-')) {
        const rating = parseInt(selectedFilter.split('-')[1]);
        return review.rating === rating;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest-rating':
          return b.rating - a.rating;
        case 'lowest-rating':
          return a.rating - b.rating;
        case 'most-helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });

  const allPhotos = reviews.flatMap(review => review.photos || []);
  const allVideos = reviews.flatMap(review => review.videos || []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
          
          {/* Review Statistics */}
          {reviewStats && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {reviewStats.averageRating}
                </div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviewStats.totalReviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-semibold mb-3">Rating Breakdown</h4>
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-2">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-full bg-yellow-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100}%` }}
                        transition={{ duration: 1, delay: rating * 0.1 }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right">
                      {reviewStats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fit Information */}
              <div>
                <h4 className="font-semibold mb-3">Fit Feedback</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Runs Small</span>
                    <span className="text-sm font-medium">{reviewStats.fitDistribution.too_small}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">True to Size</span>
                    <span className="text-sm font-medium text-green-600">{reviewStats.fitDistribution.perfect}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Runs Large</span>
                    <span className="text-sm font-medium">{reviewStats.fitDistribution.too_large}%</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>{reviewStats.recommendationPercentage}%</strong> of customers recommend this product
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Photo/Video Gallery */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Customer Photos & Videos</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPhotoGallery(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                View All ({allPhotos.length + allVideos.length})
              </button>
            </div>
          </div>
          
          {/* Media Preview */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {allPhotos.slice(0, 6).map((photo, index) => (
              <motion.div
                key={index}
                className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedMedia(photo);
                  setMediaType('photo');
                }}
              >
                <img 
                  src={photo} 
                  alt={`Customer photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>
            ))}
            {allVideos.slice(0, 2).map((video, index) => (
              <motion.div
                key={index}
                className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group relative"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedMedia(video);
                  setMediaType('video');
                }}
              >
                <video 
                  src={video}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters and Sorting */}
        <motion.div
          className="flex flex-wrap gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Reviews</option>
              <option value="with-photos">With Photos</option>
              <option value="with-videos">With Videos</option>
              <option value="verified">Verified Purchases</option>
              <option value="rating-5">5 Stars</option>
              <option value="rating-4">4 Stars</option>
              <option value="rating-3">3 Stars</option>
              <option value="rating-2">2 Stars</option>
              <option value="rating-1">1 Star</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortDesc className="w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-rating">Highest Rating</option>
              <option value="lowest-rating">Lowest Rating</option>
              <option value="most-helpful">Most Helpful</option>
            </select>
          </div>
        </motion.div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="border border-border rounded-xl p-6 bg-background"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {review.userAvatar ? (
                      <img 
                        src={review.userAvatar} 
                        alt={review.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{review.userName}</h4>
                      {review.verified && (
                        <Verified className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()} • Size {review.size} • {review.color}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fit: <span className={`font-medium ${
                      review.fit === 'perfect' ? 'text-green-600' :
                      review.fit === 'too_small' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {review.fit === 'perfect' ? 'Perfect' :
                       review.fit === 'too_small' ? 'Runs Small' :
                       'Runs Large'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-semibold mb-2">{review.title}</h5>
                <p className="text-foreground leading-relaxed">{review.content}</p>
              </div>

              {/* Rating Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.quality ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Comfort</div>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.comfort ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Style</div>
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.style ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Media */}
              {(review.photos || review.videos) && (
                <div className="mb-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {review.photos?.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Review photo ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setSelectedMedia(photo);
                          setMediaType('photo');
                        }}
                      />
                    ))}
                    {review.videos?.map((video, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setSelectedMedia(video);
                          setMediaType('video');
                        }}
                      >
                        <video src={video} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {review.tags && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpfulCount})
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    ({review.unhelpfulCount})
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Reply
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                  {review.replies.map(reply => (
                    <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <h6 className="font-medium text-sm">{reply.userName}</h6>
                        {reply.isOwner && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                            VLANCO
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Media Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedMedia(null)}
              />
              <motion.div
                className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                {mediaType === 'photo' ? (
                  <img 
                    src={selectedMedia} 
                    alt="Review media"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video 
                    src={selectedMedia}
                    controls
                    autoPlay
                    className="max-w-full max-h-full"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
            Load More Reviews
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedProductReviews; 