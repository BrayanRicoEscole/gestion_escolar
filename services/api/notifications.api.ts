import { supabase } from './client';
import { Notification } from '../../types';

export const notificationsApi = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
    }
  }
};
