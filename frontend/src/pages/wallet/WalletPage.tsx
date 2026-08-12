import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, Award, Snowflake,
  Lock, Unlock, Eye, EyeOff, RefreshCw, FileText, BarChart3, Clock,
  Plus, Minus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  useWalletDashboard, useDeposit, useWithdraw,
  useFreezeWallet, useUnfreezeWallet, useWalletTransactions, useWalletStatement,
} from '@/hooks/useWallet';
import type { WalletTransaction } from '@/types/wallet';

const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];
const PIE_COLORS = ['#6366f1', '#f59e0b'];

type Tab = 'overview' | 'transactions' | 'statement';

export function WalletPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmt, setDepositAmt] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [withdrawDesc, setWithdrawDesc] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txPage, setTxPage] = useState(0);
  const [txFilter, setTxFilter] = useState<string | undefined>(undefined);
  const now = new Date();
  const [stmtMonth, setStmtMonth] = useState(now.getMonth() + 1);
  const [stmtYear, setStmtYear] = useState(now.getFullYear());

  const { data: dashboard, isLoading } = useWalletDashboard();
  const { data: txData, isLoading: txLoading } = useWalletTransactions(txPage, 10, txFilter);
  const { data: stmtData, isLoading: stmtLoading } = useWalletStatement(stmtMonth, stmtYear);
  const depositMut = useDeposit();
  const withdrawMut = useWithdraw();
  const freezeMut = useFreezeWallet();
  const unfreezeMut = useUnfreezeWallet();

  const w = dashboard?.wallet;
  const isFrozen = w?.status === 'FROZEN';

  const handleDeposit = () => {
    const amt = parseFloat(depositAmt);
    if (isNaN(amt) || amt <= 0) return;
    depositMut.mutate({ amount: amt, description: depositDesc || undefined }, {
      onSuccess: () => { setDepositAmt(''); setDepositDesc(''); setShowDeposit(false); },
    });
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) return;
    withdrawMut.mutate({ amount: amt, description: withdrawDesc || undefined }, {
      onSuccess: () => { setWithdrawAmt(''); setWithdrawDesc(''); setShowWithdraw(false); },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const monthlyData = (dashboard?.monthlyBalances ?? []).map(m => ({
    name: m.monthName, deposits: m.deposits, withdrawals: m.withdrawals, net: m.net,
  }));

  const pieData = [
    { name: 'Deposits', value: dashboard?.depositCount ?? 0 },
    { name: 'Withdrawals', value: dashboard?.withdrawalCount ?? 0 },
  ];

  const formatWalletNum = (num?: string) => num ? num.replace(/(.{4})/g, '$1 ').trim() : '';

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemV} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" /> Digital Wallet
          </h1>
          <p className="text-muted-foreground mt-1">Manage your wallet, track transactions &amp; rewards</p>
        </div>
        <div className="flex gap-2">
          {(['overview','transactions','statement'] as Tab[]).map(t => (
            <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm"
              onClick={() => setTab(t)} className="capitalize">
              {t === 'overview' && <BarChart3 className="h-4 w-4 mr-1" />}
              {t === 'transactions' && <Clock className="h-4 w-4 mr-1" />}
              {t === 'statement' && <FileText className="h-4 w-4 mr-1" />}
              {t}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Wallet Card */}
      <motion.div variants={itemV}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/70">PaySphere Wallet</p>
                  <p className="font-mono text-lg tracking-wider">{formatWalletNum(w?.walletNumber)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold',
                  isFrozen ? 'bg-blue-400/30 text-blue-100' : 'bg-emerald-400/30 text-emerald-100')}>
                  {isFrozen && <Snowflake className="h-3 w-3 inline mr-1" />}
                  {w?.status}
                </span>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                  onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-white/60 mb-1">Current Balance</p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">
                {showBalance ? formatCurrency(w?.balance ?? 0) : '••••••'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <Award className="h-4 w-4 text-amber-300" />
                <span className="text-sm">{w?.rewardPoints ?? 0} Reward Points</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <span className="text-sm">{dashboard?.totalTransactions ?? 0} Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemV} className="flex flex-wrap gap-3">
        <Button onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }}
          className="bg-emerald-600 hover:bg-emerald-700" disabled={isFrozen}>
          <Plus className="h-4 w-4 mr-2" /> Add Money
        </Button>
        <Button onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }}
          variant="outline" disabled={isFrozen}>
          <Minus className="h-4 w-4 mr-2" /> Withdraw
        </Button>
        {isFrozen ? (
          <Button onClick={() => unfreezeMut.mutate()} variant="outline"
            disabled={unfreezeMut.isPending} className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
            <Unlock className="h-4 w-4 mr-2" /> Unfreeze Wallet
          </Button>
        ) : (
          <Button onClick={() => freezeMut.mutate()} variant="outline"
            disabled={freezeMut.isPending} className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
            <Lock className="h-4 w-4 mr-2" /> Freeze Wallet
          </Button>
        )}
      </motion.div>

      {/* Deposit/Withdraw Forms */}
      {showDeposit && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-emerald-500" /> Add Money
            </CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount ($)</label>
                  <Input type="number" placeholder="0.00" value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)} min="0.01" step="0.01" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                  <Input placeholder="e.g. Salary, Savings..." value={depositDesc}
                    onChange={e => setDepositDesc(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map(v => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setDepositAmt(String(v))}>
                    ${v.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDeposit} disabled={depositMut.isPending || !depositAmt}
                  className="bg-emerald-600 hover:bg-emerald-700">
                  {depositMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Deposit
                </Button>
                <Button variant="ghost" onClick={() => setShowDeposit(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showWithdraw && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-orange-500" /> Withdraw Money
            </CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount ($)</label>
                  <Input type="number" placeholder="0.00" value={withdrawAmt}
                    onChange={e => setWithdrawAmt(e.target.value)} min="0.01" step="0.01" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                  <Input placeholder="e.g. ATM, Transfer..." value={withdrawDesc}
                    onChange={e => setWithdrawDesc(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Available: {formatCurrency(w?.balance ?? 0)}</p>
              <div className="flex gap-2">
                <Button onClick={handleWithdraw} disabled={withdrawMut.isPending || !withdrawAmt}
                  className="bg-orange-600 hover:bg-orange-700 text-white">
                  {withdrawMut.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Withdrawal
                </Button>
                <Button variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tab Content */}
      {tab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Total Deposits', value: formatCurrency(dashboard?.totalDeposits ?? 0), icon: ArrowDownLeft, color: 'from-emerald-500 to-emerald-600', sub: `${dashboard?.depositCount ?? 0} transactions` },
              { title: 'Total Withdrawals', value: formatCurrency(dashboard?.totalWithdrawals ?? 0), icon: ArrowUpRight, color: 'from-orange-500 to-orange-600', sub: `${dashboard?.withdrawalCount ?? 0} transactions` },
              { title: 'Reward Points', value: String(w?.rewardPoints ?? 0), icon: Award, color: 'from-amber-500 to-amber-600', sub: '1 pt per $10 deposited' },
              { title: 'Wallet Status', value: w?.status ?? 'N/A', icon: isFrozen ? Snowflake : Wallet, color: isFrozen ? 'from-blue-500 to-blue-600' : 'from-indigo-500 to-indigo-600', sub: w?.currency ?? 'USD' },
            ].map(card => (
              <motion.div key={card.title} variants={itemV}>
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                      <card.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                  </CardContent>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Monthly Balance Chart */}
            <motion.div variants={itemV} className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle className="text-lg">Monthly Balance</CardTitle></CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gWith" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="deposits" stroke="#6366f1" fill="url(#gDep)" strokeWidth={2} name="Deposits" />
                        <Area type="monotone" dataKey="withdrawals" stroke="#f59e0b" fill="url(#gWith)" strokeWidth={2} name="Withdrawals" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No data yet — make your first transaction!
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pie Chart */}
            <motion.div variants={itemV}>
              <Card className="h-full">
                <CardHeader><CardTitle className="text-lg">Transaction Split</CardTitle></CardHeader>
                <CardContent>
                  {(dashboard?.totalTransactions ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                          dataKey="value" paddingAngle={4} strokeWidth={0}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                      No transactions yet
                    </div>
                  )}
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-indigo-500" /><span className="text-xs">Deposits</span></div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500" /><span className="text-xs">Withdrawals</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={itemV}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTab('transactions')}>View All</Button>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={dashboard?.recentTransactions ?? []} />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {tab === 'transactions' && (
        <motion.div variants={itemV}>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">All Transactions</CardTitle>
              <div className="flex gap-2">
                {[undefined, 'DEPOSIT', 'WITHDRAWAL'].map(f => (
                  <Button key={f ?? 'all'} variant={txFilter === f ? 'default' : 'outline'} size="sm"
                    onClick={() => { setTxFilter(f); setTxPage(0); }}>
                    {f ?? 'All'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : (
                <>
                  <TransactionList transactions={txData?.content ?? []} />
                  {(txData?.totalPages ?? 0) > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {(txData?.page ?? 0) + 1} of {txData?.totalPages ?? 1}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={txPage === 0}
                          onClick={() => setTxPage(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={txData?.last}
                          onClick={() => setTxPage(p => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 'statement' && (
        <motion.div variants={itemV}>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">Wallet Statement</CardTitle>
              <div className="flex gap-2 items-center">
                <select className="rounded-lg border bg-background px-3 py-2 text-sm"
                  value={stmtMonth} onChange={e => setStmtMonth(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select className="rounded-lg border bg-background px-3 py-2 text-sm"
                  value={stmtYear} onChange={e => setStmtYear(Number(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {stmtLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
              ) : stmtData ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Opening Balance', value: formatCurrency(stmtData.openingBalance) },
                      { label: 'Closing Balance', value: formatCurrency(stmtData.closingBalance) },
                      { label: 'Total Deposits', value: formatCurrency(stmtData.totalDeposits) },
                      { label: 'Total Withdrawals', value: formatCurrency(stmtData.totalWithdrawals) },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-bold mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {stmtData.transactionCount} transaction{stmtData.transactionCount !== 1 ? 's' : ''} in this period
                    </p>
                    <TransactionList transactions={stmtData.transactions} />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Select a period to view statement</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (!transactions.length) {
    return <p className="text-center text-muted-foreground py-8">No transactions found</p>;
  }
  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.id} className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full',
              tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500')}>
              {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-medium">{tx.description || tx.type}</p>
              <p className="text-xs text-muted-foreground">{tx.referenceId.slice(0, 16)}… · {formatDate(tx.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-sm font-semibold', tx.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-foreground')}>
              {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
            {tx.rewardPoints > 0 && (
              <p className="text-xs text-amber-500">+{tx.rewardPoints} pts</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
