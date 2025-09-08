import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type UserRow = Tables<'users'>;
export type AddressRow = Tables<'addresses'>;
export type UserActivityRow = Tables<'user_activities'>;

export interface UserWithAddresses extends UserRow {
  addresses?: AddressRow[];
}

// Fetch user profile with addresses
export async function fetchUserProfile(userId: string): Promise<UserWithAddresses | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      addresses(*)
    `)
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserWithAddresses || null;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserRow>): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add user address
export async function addUserAddress(params: {
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  type?: string;
  isDefault?: boolean;
}): Promise<AddressRow> {
  // If this is set as default, unset other default addresses first
  if (params.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', params.userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: params.userId,
      first_name: params.firstName,
      last_name: params.lastName,
      company: params.company,
      address_line_1: params.addressLine1,
      address_line_2: params.addressLine2,
      city: params.city,
      state: params.state,
      postal_code: params.postalCode,
      country: params.country,
      phone: params.phone,
      type: params.type || 'shipping',
      is_default: params.isDefault || false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update user address
export async function updateUserAddress(addressId: string, userId: string, updates: Partial<AddressRow>): Promise<AddressRow> {
  // If this is set as default, unset other default addresses first
  if (updates.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete user address
export async function deleteUserAddress(addressId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Get user addresses
export async function fetchUserAddresses(userId: string): Promise<AddressRow[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Log user activity
export async function logUserActivity(params: {
  userId: string;
  activityType: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
}): Promise<void> {
  const { error } = await supabase
    .from('user_activities')
    .insert({
      user_id: params.userId,
      activity_type: params.activityType,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: params.metadata,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// Get user activity history
export async function fetchUserActivities(userId: string, limit: number = 50): Promise<UserActivityRow[]> {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Update user loyalty points
export async function updateUserLoyaltyPoints(userId: string, pointsDelta: number): Promise<number> {
  // Get current points
  const { data: user } = await supabase
    .from('users')
    .select('loyalty_points')
    .eq('id', userId)
    .single();

  const currentPoints = user?.loyalty_points || 0;
  const newPoints = Math.max(0, currentPoints + pointsDelta);

  const { error } = await supabase
    .from('users')
    .update({ 
      loyalty_points: newPoints,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;

  // Log the activity
  await logUserActivity({
    userId,
    activityType: pointsDelta > 0 ? 'points_earned' : 'points_spent',
    metadata: { points_delta: pointsDelta, new_total: newPoints },
  });

  return newPoints;
}

// Update user tier based on spending
export async function updateUserTier(userId: string): Promise<string> {
  // Get user's total spending
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('user_id', userId)
    .eq('payment_status', 'paid');

  const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  let tierLevel = 'bronze';
  if (totalSpent >= 10000) tierLevel = 'diamond';
  else if (totalSpent >= 5000) tierLevel = 'platinum';
  else if (totalSpent >= 2000) tierLevel = 'gold';
  else if (totalSpent >= 500) tierLevel = 'silver';

  // Update user tier and total spent
  const { error } = await supabase
    .from('users')
    .update({ 
      tier_level: tierLevel,
      total_spent: totalSpent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;

  return tierLevel;
}
