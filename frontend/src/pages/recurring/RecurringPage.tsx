import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Repeat,
  Plus,
  Pause,
  Play,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { recurringApi } from '@/api/recurring';
import type { RecurringPayment, RecurringPaymentRequest, RecurringPaymentStatus, RecurringPaymentFrequency } from '@/types/recurring';
import type { PagedResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusConfig: Record<RecurringPaymentStatus, { color: string; icon: React.ReactNode; label: string }> = {
  ACTIVE: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <Zap className="h-3.5 w-3.5" />, label: 'Active' },
  PAUSED: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <Pause className="h-3.5 w-3.5" />, label: 'Paused' },
  CANCELLED: { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Cancelled' },
  COMPLETED: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Completed' },
};

const frequencyLabels: Record<RecurringPaymentFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
};

const categories = ['Bills', 'Rent', 'Subscription', 'Savings', 'Insurance', 'Loan', 'Other'];

export function RecurringPage() {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [form, setForm] = useState<RecurringPaymentRequest>({
    recipientEmail: '',
    amount: 0,
    frequency: 'MONTHLY',
    note: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchPayments = useCallback(async (p: number = 0) => {
    setIsLoading(true);
    try {
      const result = await recurringApi.getAll(p, 20);
      const paged = result.data as PagedResponse<RecurringPayment>;
      setPayments(p === 0 ? paged.content : (prev) => [...prev, ...paged.content]);
      setTotalPages(paged.totalPages);
      setPage(p);
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(0);
  }, [fetchPayments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.recipientEmail || !form.amount || !form.frequency) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (form.amount < 1) {
      setFormError('Minimum amount is $1.00');
      return;
    }

    setFormLoading(true);
    try {
      await recurringApi.create(form);
      setShowForm(false);
      setForm({
        recipientEmail: '',
        amount: 0,
        frequency: 'MONTHLY',
        note: '',
        category: '',
        startDate: new Date().toISOString().split('T')[0],
      });
      fetchPayments(0);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create recurring payment');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await recurringApi.pause(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? result.data : p)));
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await recurringApi.resume(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? result.data : p)));
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this recurring payment? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await recurringApi.cancel(id);
      setPayments((prev) => prev.map((p) =>
        p.id === id ? { ...p, status: 'CANCELLED' as RecurringPaymentStatus } : p
      ));
    } catch { /* silent */ } finally {
      setActionLoading(null);
    }
  };

  const activeCount = payments.filter((p) => p.status === 'ACTIVE').length;
  const pausedCount = payments.filter((p) => p.status === 'PAUSED').length;
  const totalAmount = payments
    .filter((p) => p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate your regular payments and never miss a bill.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Recurring Payment'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              Active
            </div>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Pause className="h-3.5 w-3.5 text-amber-500" />
              Paused
            </div>
            <p className="text-2xl font-bold text-amber-600">{pausedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              Monthly Commitment
            </div>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Repeat className="h-3.5 w-3.5" />
              Total
            </div>
            <p className="text-2xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create Recurring Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rp-email">Recipient Email *</Label>
                      <Input
                        id="rp-email"
                        type="email"
                        placeholder="recipient@example.com"
                        value={form.recipientEmail}
                        onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp-amount">Amount ($) *</Label>
                      <Input
                        id="rp-amount"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="100.00"
                        value={form.amount || ''}
                        onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp-frequency">Frequency *</Label>
                      <select
                        id="rp-frequency"
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="BIWEEKLY">Bi-weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp-category">Category</Label>
                      <select
                        id="rp-category"
                        value={form.category || ''}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp-start">Start Date</Label>
                      <Input
                        id="rp-start"
                        type="date"
                        value={form.startDate || ''}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rp-end">End Date (optional)</Label>
                      <Input
                        id="rp-end"
                        type="date"
                        value={form.endDate || ''}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="rp-note">Note (optional)</Label>
                      <Input
                        id="rp-note"
                        placeholder="Monthly rent payment, utility bill, etc."
                        value={form.note || ''}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="gradient-primary text-white min-w-[140px]"
                    >
                      {formLoading ? 'Creating...' : 'Create Payment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payments List */}
      <div className="space-y-3">
        {isLoading && payments.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="animate-pulse text-muted-foreground">Loading recurring payments...</div>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Repeat className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="font-medium text-muted-foreground">No recurring payments</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Create your first recurring payment to automate your bills.
                </p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="gradient-primary text-white gap-2 mt-2"
              >
                <Plus className="h-4 w-4" />
                Create Recurring Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {payments.map((payment, index) => {
              const config = statusConfig[payment.status];
              const isExpanded = expandedId === payment.id;

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-shadow hover:shadow-md ${
                    payment.status === 'ACTIVE' ? 'border-l-4 border-l-emerald-500' :
                    payment.status === 'PAUSED' ? 'border-l-4 border-l-amber-500' :
                    payment.status === 'CANCELLED' ? 'border-l-4 border-l-red-500' :
                    'border-l-4 border-l-blue-500'
                  }`}>
                    <CardContent className="p-5">
                      {/* Main Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Avatar */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary text-white text-sm font-bold">
                            {payment.recipientName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{payment.recipientName}</p>
                            <p className="text-xs text-muted-foreground truncate">{payment.recipientEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Amount */}
                          <div className="text-right">
                            <p className="font-bold text-lg">${payment.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {frequencyLabels[payment.frequency]}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </span>

                          {/* Expand */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Start Date
                                  </p>
                                  <p className="font-medium">{new Date(payment.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Next Payment
                                  </p>
                                  <p className="font-medium">
                                    {payment.status === 'ACTIVE' || payment.status === 'PAUSED'
                                      ? new Date(payment.nextExecution).toLocaleDateString()
                                      : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                    <Repeat className="h-3 w-3" /> Executed
                                  </p>
                                  <p className="font-medium">
                                    {payment.totalExecuted} time{payment.totalExecuted !== 1 ? 's' : ''}
                                    {payment.maxExecutions ? ` / ${payment.maxExecutions}` : ''}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Category
                                  </p>
                                  <p className="font-medium">{payment.category || '—'}</p>
                                </div>
                              </div>

                              {payment.note && (
                                <div className="text-sm">
                                  <p className="text-muted-foreground text-xs mb-1">Note</p>
                                  <p className="text-sm bg-muted/50 rounded-lg px-3 py-2">{payment.note}</p>
                                </div>
                              )}

                              {payment.lastExecuted && (
                                <p className="text-xs text-muted-foreground">
                                  Last executed: {new Date(payment.lastExecuted).toLocaleString()}
                                </p>
                              )}

                              {/* Actions */}
                              {(payment.status === 'ACTIVE' || payment.status === 'PAUSED') && (
                                <div className="flex gap-2 pt-2">
                                  {payment.status === 'ACTIVE' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePause(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="gap-1.5"
                                    >
                                      <Pause className="h-3.5 w-3.5" />
                                      Pause
                                    </Button>
                                  )}
                                  {payment.status === 'PAUSED' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResume(payment.id)}
                                      disabled={actionLoading === payment.id}
                                      className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    >
                                      <Play className="h-3.5 w-3.5" />
                                      Resume
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancel(payment.id)}
                                    disabled={actionLoading === payment.id}
                                    className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Load More */}
      {page < totalPages - 1 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchPayments(page + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
