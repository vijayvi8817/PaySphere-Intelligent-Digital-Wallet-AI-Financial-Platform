import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Shield,
  Link2,
  User,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { notificationApi } from '@/api/notification';
import type { Notification, NotificationType } from '@/types/notification';
import type { PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; label: string }> = {
  TRANSFER_SENT: { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-orange-500 bg-orange-500/10', label: 'Sent' },
  TRANSFER_RECEIVED: { icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-emerald-500 bg-emerald-500/10', label: 'Received' },
  DEPOSIT: { icon: <Wallet className="h-4 w-4" />, color: 'text-blue-500 bg-blue-500/10', label: 'Deposit' },
  WITHDRAWAL: { icon: <Wallet className="h-4 w-4" />, color: 'text-amber-500 bg-amber-500/10', label: 'Withdrawal' },
  WALLET_FROZEN: { icon: <Shield className="h-4 w-4" />, color: 'text-sky-500 bg-sky-500/10', label: 'Frozen' },
  WALLET_UNFROZEN: { icon: <Shield className="h-4 w-4" />, color: 'text-green-500 bg-green-500/10', label: 'Unfrozen' },
  ACCOUNT_LINKED: { icon: <Link2 className="h-4 w-4" />, color: 'text-violet-500 bg-violet-500/10', label: 'Linked' },
  ACCOUNT_VERIFIED: { icon: <Check className="h-4 w-4" />, color: 'text-teal-500 bg-teal-500/10', label: 'Verified' },
  PASSWORD_CHANGED: { icon: <Shield className="h-4 w-4" />, color: 'text-red-500 bg-red-500/10', label: 'Security' },
  PROFILE_UPDATED: { icon: <User className="h-4 w-4" />, color: 'text-indigo-500 bg-indigo-500/10', label: 'Profile' },
  SYSTEM: { icon: <Settings className="h-4 w-4" />, color: 'text-gray-500 bg-gray-500/10', label: 'System' },
};

const filters: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Transfers', value: 'transfer' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'Security', value: 'security' },
  { label: 'Accounts', value: 'account' },
  { label: 'System', value: 'system' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function matchesFilter(type: NotificationType, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'transfer') return type === 'TRANSFER_SENT' || type === 'TRANSFER_RECEIVED';
  if (filter === 'wallet') return type === 'DEPOSIT' || type === 'WITHDRAWAL' || type === 'WALLET_FROZEN' || type === 'WALLET_UNFROZEN';
  if (filter === 'security') return type === 'PASSWORD_CHANGED';
  if (filter === 'account') return type === 'ACCOUNT_LINKED' || type === 'ACCOUNT_VERIFIED' || type === 'PROFILE_UPDATED';
  if (filter === 'system') return type === 'SYSTEM';
  return true;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async (p: number = 0) => {
    setIsLoading(true);
    try {
      const [result, countResult] = await Promise.all([
        notificationApi.getAll(p, 20),
        notificationApi.getUnreadCount(),
      ]);
      const paged = result.data as PagedResponse<Notification>;
      setNotifications(p === 0 ? paged.content : (prev) => [...prev, ...paged.content]);
      setTotalPages(paged.totalPages);
      setPage(p);
      setUnreadCount(countResult.data.count);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const filtered = notifications.filter((n) => matchesFilter(n.type, filter));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up! No unread notifications.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifications(0)}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Bell className="h-3.5 w-3.5" />
              Total
            </div>
            <p className="text-2xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <BellOff className="h-3.5 w-3.5" />
              Unread
            </div>
            <p className="text-2xl font-bold text-destructive">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Transfers
            </div>
            <p className="text-2xl font-bold">
              {notifications.filter((n) => n.type === 'TRANSFER_SENT' || n.type === 'TRANSFER_RECEIVED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Shield className="h-3.5 w-3.5" />
              Security
            </div>
            <p className="text-2xl font-bold">
              {notifications.filter((n) => n.type === 'PASSWORD_CHANGED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === f.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <Card>
        <CardContent className="p-0 divide-y">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">
                  {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                </p>
              </motion.div>
            ) : (
              filtered.map((notification, index) => {
                const config = typeConfig[notification.type] || typeConfig.SYSTEM;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${
                      !notification.read ? 'bg-primary/[0.02]' : ''
                    }`}
                  >
                    {/* Type Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
                            {timeAgo(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Check className="h-3 w-3" />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Load More */}
      {page < totalPages - 1 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNotifications(page + 1)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? 'Loading...' : 'Load more notifications'}
          </Button>
        </div>
      )}
    </div>
  );
}
