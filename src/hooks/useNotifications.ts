import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  registerPushToken,
  removePushToken,
  type NotificationRow,
} from '@/services/notificationService';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly: boolean = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [notificationsData, unreadCountData] = await Promise.all([
        getUserNotifications({ userId: user.id, limit: 50, unreadOnly }),
        getUnreadNotificationCount(user.id),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      setError(null);
      
      await markNotificationAsRead(notificationId, user.id);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      
      await markAllNotificationsAsRead(user.id);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      setUnreadCount(0);

      toast({
        title: 'All notifications marked as read',
        description: 'Your notifications have been updated',
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user]);

  // Delete notification
  const deleteNotif = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      setError(null);
      
      await deleteNotification(notificationId, user.id);

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed',
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user, notifications]);

  // Register push notification token
  const registerPush = useCallback(async (token: string, platform: 'web' | 'ios' | 'android' = 'web') => {
    if (!user) return;

    try {
      setError(null);
      
      await registerPushToken({
        userId: user.id,
        token,
        platform,
      });

      toast({
        title: 'Push notifications enabled',
        description: 'You will now receive push notifications',
      });
    } catch (err) {
      console.error('Error registering push token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable push notifications';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user]);

  // Remove push notification token
  const unregisterPush = useCallback(async (token: string) => {
    if (!user) return;

    try {
      setError(null);
      
      await removePushToken({
        userId: user.id,
        token,
      });

      toast({
        title: 'Push notifications disabled',
        description: 'You will no longer receive push notifications',
      });
    } catch (err) {
      console.error('Error removing push token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable push notifications';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [user]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.is_read);
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time notifications subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationRow;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    registerPush,
    unregisterPush,
    getUnreadNotifications,
    getNotificationsByType,
    refetch: fetchNotifications,
  };
}
