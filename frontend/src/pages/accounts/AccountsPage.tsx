import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Trash2, Star, ShieldCheck,
  CreditCard, AlertCircle, CheckCircle2, Clock, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { linkedAccountApi } from '@/api/linkedAccount';
import type { LinkedAccount, LinkedAccountRequest } from '@/types/linkedAccount';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BANK_ICONS: Record<string, string> = {
  'Chase': '🏦',
  'Bank of America': '🏛️',
  'Wells Fargo': '💰',
  'Citibank': '🏢',
  'Capital One': '💳',
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  VERIFIED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  PENDING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  FAILED: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
};

export function AccountsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form state
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountType, setAccountType] = useState('CHECKING');

  const { data, isLoading } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: () => linkedAccountApi.getAccounts(),
  });

  const accounts = data?.data ?? [];

  const addMutation = useMutation({
    mutationFn: (req: LinkedAccountRequest) => linkedAccountApi.addAccount(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      resetForm();
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => linkedAccountApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      setDeleteConfirmId(null);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => linkedAccountApi.setPrimary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['linked-accounts'] }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => linkedAccountApi.verifyAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['linked-accounts'] }),
  });

  const resetForm = () => {
    setAccountName('');
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setAccountType('CHECKING');
  };

  const handleAdd = () => {
    addMutation.mutate({
      accountName,
      bankName,
      accountNumber,
      routingNumber: routingNumber || undefined,
      accountType,
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" /> Linked Accounts
          </h1>
          <p className="text-muted-foreground mt-1">Manage your connected bank accounts</p>
        </div>
        <Button
          onClick={() => { setShowAddForm(!showAddForm); resetForm(); }}
          className="gap-2"
          disabled={accounts.length >= 5}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? 'Cancel' : 'Link Account'}
        </Button>
      </motion.div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length} / 5</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'VERIFIED').length}</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'PENDING').length}</div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          </Card>
        </motion.div>
      </div>

      {/* Add Account Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Link New Bank Account</CardTitle>
                <CardDescription>Connect a bank account to enable transfers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accounts-account-name">Account Name</Label>
                    <Input
                      id="accounts-account-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. My Checking Account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accounts-bank-name">Bank Name</Label>
                    <Input
                      id="accounts-bank-name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Chase, Bank of America"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accounts-account-number">Account Number</Label>
                    <Input
                      id="accounts-account-number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accounts-routing-number">Routing Number (Optional)</Label>
                    <Input
                      id="accounts-routing-number"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9-digit routing number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex gap-2">
                    {['CHECKING', 'SAVINGS', 'BUSINESS'].map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={accountType === type ? 'default' : 'outline'}
                        onClick={() => setAccountType(type)}
                      >
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdd}
                    disabled={!accountName || !bankName || !accountNumber || addMutation.isPending}
                    className="gap-2"
                  >
                    {addMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Link Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Your Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg p-4 animate-pulse">
                    <div className="h-12 w-12 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                    <div className="h-8 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No linked accounts</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Link a bank account to get started</p>
                <Button className="mt-4 gap-2" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4" /> Link Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account: LinkedAccount) => {
                  const statusConfig = STATUS_CONFIG[account.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusConfig!.icon;

                  return (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:bg-muted/50 border border-border group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-2xl">
                          {BANK_ICONS[account.bankName] ?? '🏦'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{account.accountName}</p>
                            {account.primary && (
                              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{account.bankName} · {account.maskedAccountNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusConfig!.bg} ${statusConfig!.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {account.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!account.primary && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setPrimaryMutation.mutate(account.id)}
                            title="Set as primary"
                            className="h-8 w-8"
                          >
                            <Star className="h-4 w-4 text-amber-500" />
                          </Button>
                        )}
                        {account.status === 'PENDING' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => verifyMutation.mutate(account.id)}
                            title="Verify account"
                            className="h-8 w-8"
                          >
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          </Button>
                        )}
                        {deleteConfirmId === account.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(account.id)}
                              disabled={deleteMutation.isPending}
                              className="h-8 text-xs"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(null)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(account.id)}
                            title="Remove account"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
