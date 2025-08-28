import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Filter, ChevronDown } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

// Mock reviews data - replace with real data from Supabase
const mockReviews = [
  {
    id: '1',
    user: { name: 'Alex Chen', avatar: '/placeholder.svg' },
    rating: 5,
    title: 'Perfect fit and quality!',
    comment: 'This hoodie exceeded my expectations. The material is premium and the fit is exactly what I wanted. The design is clean and the quality construction is evident.',
    date: '2024-01-15',
    verified: true,
    helpful: 12,
    images: ['/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '2',
    user: { name: 'Jordan Smith', avatar: '/placeholder.svg' },
    rating: 4,
    title: 'Great style, runs slightly large',
    comment: 'Love the design and the streetwear aesthetic. Only issue is it runs a bit larger than expected, so maybe size down if you want a fitted look.',
    date: '2024-01-10',
    verified: true,
    helpful: 8,
    images: []
  },
  {
    id: '3',
    user: { name: 'Maya Rodriguez', avatar: '/placeholder.svg' },
    rating: 5,
    title: 'My new favorite piece',
    comment: 'This is now my go-to piece for any casual outfit. The quality is outstanding and it looks even better in person. Highly recommend!',
    date: '2024-01-08',
    verified: false,
    helpful: 15,
    images: ['/placeholder.svg']
  }
];

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const averageRating = 4.6;
  const totalReviews = mockReviews.length;

  const ratingDistribution = [
    { stars: 5, count: 45, percentage: 60 },
    { stars: 4, count: 22, percentage: 30 },
    { stars: 3, count: 5, percentage: 7 },
    { stars: 2, count: 2, percentage: 3 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="mt-16 space-y-8">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Customer Reviews</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-8 p-6 bg-muted/50 rounded-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-foreground">{averageRating}</div>
            <div>
              <div className="flex text-yellow-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{item.stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: item.stars * 0.1 }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg"
        >
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="with-photos">With Photos</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {mockReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 border border-border rounded-xl space-y-4"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                  {review.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{review.user.name}</h4>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">{review.title}</h5>
              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((image, i) => (
                    <div key={i} className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      <img src={image} alt={`Review image ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="w-4 h-4" />
                Yes ({review.helpful})
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsDown className="w-4 h-4" />
                No
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Write Review Button */}
      <div className="text-center pt-8">
        <button className="btn-primary px-8 py-3">
          Write a Review
        </button>
      </div>
    </div>
  );
};

export default ProductReviews;