import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ReviewRow = Tables<'reviews'>;
export type ReviewVoteRow = Tables<'review_votes'>;

export interface ReviewWithUser extends ReviewRow {
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  votes?: ReviewVoteRow[];
  helpful_count?: number;
}

// Fetch reviews for a product
export async function fetchProductReviews(productId: string): Promise<ReviewWithUser[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users!reviews_user_id_fkey(id, full_name, avatar_url, username),
      votes:review_votes(*)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReviewWithUser[] || [];
}

// Submit a new review
export async function submitProductReview(params: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  orderId?: string;
}): Promise<ReviewRow> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: params.productId,
      user_id: params.userId,
      rating: params.rating,
      title: params.title,
      comment: params.comment,
      images: params.images,
      order_id: params.orderId,
      is_verified_purchase: !!params.orderId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  // Update product rating statistics
  await updateProductRatingStats(params.productId);
  
  return data;
}

// Vote on a review (helpful/not helpful)
export async function voteOnReview(params: {
  reviewId: string;
  userId: string;
  isHelpful: boolean;
}): Promise<void> {
  // First, check if user already voted
  const { data: existingVote } = await supabase
    .from('review_votes')
    .select('*')
    .eq('review_id', params.reviewId)
    .eq('user_id', params.userId)
    .single();

  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from('review_votes')
      .update({ is_helpful: params.isHelpful })
      .eq('id', existingVote.id);
    
    if (error) throw error;
  } else {
    // Insert new vote
    const { error } = await supabase
      .from('review_votes')
      .insert({
        review_id: params.reviewId,
        user_id: params.userId,
        is_helpful: params.isHelpful,
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }

  // Update helpful count on review
  await updateReviewHelpfulCount(params.reviewId);
}

// Update review helpful count
async function updateReviewHelpfulCount(reviewId: string): Promise<void> {
  const { data: votes } = await supabase
    .from('review_votes')
    .select('is_helpful')
    .eq('review_id', reviewId);

  const helpfulCount = votes?.filter(vote => vote.is_helpful).length || 0;

  const { error } = await supabase
    .from('reviews')
    .update({ helpful_count: helpfulCount })
    .eq('id', reviewId);

  if (error) throw error;
}

// Update product rating statistics
async function updateProductRatingStats(productId: string): Promise<void> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (!reviews || reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const { error } = await supabase
    .from('products')
    .update({
      rating_average: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      rating_count: reviews.length,
    })
    .eq('id', productId);

  if (error) throw error;
}

// Delete a review (only by the author)
export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Get review statistics for a product
export async function getProductReviewStats(productId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {} as { [key: number]: number });

  // Ensure all ratings 1-5 are represented
  for (let i = 1; i <= 5; i++) {
    if (!ratingDistribution[i]) {
      ratingDistribution[i] = 0;
    }
  }

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
  };
}
