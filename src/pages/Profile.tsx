import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Calendar, MapPin, Settings, ShoppingBag, Heart } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: ''
  });
  const [stats, setStats] = useState({
    cartItems: 0,
    wishlistItems: 0,
    orders: 0,
    reviews: 0
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || ''
      });
    }
    loadUserStats();
    setLoading(false);
  }, [profile]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Get cart items count
      const { count: cartCount } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get wishlist items count (try both table names)
      let wishlistCount = 0;
      try {
        const { count } = await supabase
          .from('wishlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        wishlistCount = count || 0;
      } catch {
        // Try wishlists table as fallback
        const { count } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        wishlistCount = count || 0;
      }

      // Get orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get reviews count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        cartItems: cartCount || 0,
        wishlistItems: wishlistCount || 0,
        orders: ordersCount || 0,
        reviews: reviewsCount || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(formData);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background pt-20 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent text-center">
              Profile
            </h1>
            <p className="text-muted-foreground text-center mt-4">
              Manage your account details and preferences.
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-32 animate-pulse rounded-3xl bg-muted/40" />
              <div className="h-96 animate-pulse rounded-3xl bg-muted/40" />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* User Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.cartItems}</div>
                      <p className="text-xs text-muted-foreground">Items in your cart</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.wishlistItems}</div>
                      <p className="text-xs text-muted-foreground">Saved items</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Orders</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.orders}</div>
                      <p className="text-xs text-muted-foreground">Total orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.reviews}</div>
                      <p className="text-xs text-muted-foreground">Reviews written</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                    <CardDescription>Your account information at a glance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <p className="text-sm text-muted-foreground">{user?.email || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {profile?.first_name || profile?.last_name 
                            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <p className="text-sm text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Member Since
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent interactions with VLANCO</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Cart Activity</p>
                          <p className="text-sm text-muted-foreground">{stats.cartItems} items currently in cart</p>
                        </div>
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Wishlist Activity</p>
                          <p className="text-sm text-muted-foreground">{stats.wishlistItems} items in wishlist</p>
                        </div>
                        <Heart className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order History</p>
                          <p className="text-sm text-muted-foreground">{stats.orders} total orders placed</p>
                        </div>
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account ID</Label>
                      <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                        {user?.id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.email_confirmed_at ? 'Verified' : 'Not verified'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Account Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;

