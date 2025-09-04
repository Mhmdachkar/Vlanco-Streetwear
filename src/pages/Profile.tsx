import React, { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-background/80 backdrop-blur-sm rounded-3xl border border-border/50 p-6">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              {loading ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="truncate max-w-[60%]">{user?.id || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Verified</span><span>{user ? 'Yes' : 'No'}</span></div>
                </div>
              )}
            </div>

            <div className="bg-background/80 backdrop-blur-sm rounded-3xl border border-border/50 p-6">
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <p className="text-muted-foreground text-sm">Coming soon.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;

