import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import {
  fetchProductReviews,
  submitProductReview,
  voteOnReview,
  deleteReview,
  getProductReviewStats,
  type ReviewWithUser,
} from '@/services/reviewService';

export function useReviews(productId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);

  // Fetch reviews for product
  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const [reviewsData, statsData] = await Promise.all([
        fetchProductReviews(productId),
        getProductReviewStats(productId),
      ]);

      setReviews(reviewsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Submit new review
  const submitReview = useCallback(async (params: {
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
    orderId?: string;
  }) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    try {
      setError(null);
      
      await submitProductReview({
        productId,
        userId: user.id,
        ...params,
      });

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });

      // Refresh reviews
      await fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, productId, fetchReviews]);

  // Vote on review
  const voteReview = useCallback(async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote on reviews',
        variant: 'destructive',
      });
      return;
    }

    try {
      setError(null);
      
      await voteOnReview({
        reviewId,
        userId: user.id,
        isHelpful,
      });

      toast({
        title: 'Vote recorded',
        description: 'Thank you for your feedback',
      });

      // Refresh reviews to show updated vote counts
      await fetchReviews();
    } catch (err) {
      console.error('Error voting on review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote on review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, fetchReviews]);

  // Delete review (only by author)
  const removeReview = useCallback(async (reviewId: string) => {
    if (!user) return;

    try {
      setError(null);
      
      await deleteReview(reviewId, user.id);

      toast({
        title: 'Review deleted',
        description: 'Your review has been removed',
      });

      // Refresh reviews
      await fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, fetchReviews]);

  // Check if user can review (hasn't reviewed this product yet)
  const canUserReview = useCallback(() => {
    if (!user) return false;
    return !reviews.some(review => review.user_id === user.id);
  }, [user, reviews]);

  // Get user's review for this product
  const getUserReview = useCallback(() => {
    if (!user) return null;
    return reviews.find(review => review.user_id === user.id) || null;
  }, [user, reviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    stats,
    submitReview,
    voteReview,
    removeReview,
    canUserReview,
    getUserReview,
    refetch: fetchReviews,
  };
}
