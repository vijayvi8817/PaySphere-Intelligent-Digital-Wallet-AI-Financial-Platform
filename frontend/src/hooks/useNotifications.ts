import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '@/api/notification';
import type { Notification } from '@/types/notification';
import { useAuth } from '@/hooks/useAuth';

const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Hook that manages notification state with periodic polling.
 * Provides unread count, recent notifications, and actions.
 */
export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await notificationApi.getUnreadCount();
      setUnreadCount(result.data.count);
    } catch {
      // Silently fail on background polling
    }
  }, [isAuthenticated]);

  const fetchRecent = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const result = await notificationApi.getRecent();
      setNotifications(result.data);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silent
    }
  }, []);

  const refresh = useCallback(() => {
    fetchUnreadCount();
    fetchRecent();
  }, [fetchUnreadCount, fetchRecent]);

  // Initial fetch + polling
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();
    fetchRecent();

    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, fetchUnreadCount, fetchRecent]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
