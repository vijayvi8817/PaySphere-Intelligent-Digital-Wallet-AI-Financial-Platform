import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  CreditCard,
  ArrowLeftRight,
  UserCheck,
  Globe,
  Clock,
} from 'lucide-react';
import { getMyAuditLogs } from '@/api/audit';
import { AuditLog, AuditCategory, AuditSeverity } from '@/types/audit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_ICONS: Record<AuditCategory, any> = {
  AUTH: KeyRound,
  CARD: CreditCard,
  TRANSACTION: ArrowLeftRight,
  SECURITY: ShieldCheck,
  ADMIN: ShieldAlert,
  KYC: UserCheck,
};

const SEVERITY_STYLES: Record<AuditSeverity, string> = {
  INFO: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  WARNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await getMyAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      log.ipAddress.includes(search);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Audit Log & Activity History</h1>
        <p className="text-muted-foreground mt-1">
          Monitor real-time security events, account authorizations, card management actions, and sign-in sessions.
        </p>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'AUTH', 'CARD', 'TRANSACTION', 'SECURITY', 'KYC'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize text-xs"
            >
              {cat.toLowerCase()}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action, IP, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Log Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" /> Security Audit Feed ({filteredLogs.length})
          </CardTitle>
          <CardDescription>Immutable real-time security activity stream for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading audit records...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No audit logs matching your filters.</div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const Icon = CATEGORY_ICONS[log.category] || ShieldCheck;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-all gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted border mt-0.5">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{log.action.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className={SEVERITY_STYLES[log.severity]}>
                            {log.severity}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                            {log.category}
                          </Badge>
                        </div>
                        {log.details && (
                          <p className="text-xs text-muted-foreground font-mono">{log.details}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="flex items-center gap-1 font-mono">
                        <Globe className="h-3.5 w-3.5" />
                        {log.ipAddress}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
