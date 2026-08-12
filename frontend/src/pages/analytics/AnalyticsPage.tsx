import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3, Award, ArrowUpRight,
  ArrowDownLeft, Activity, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { analyticsApi } from '@/api/analytics';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#14b8a6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

export function AnalyticsPage() {
  const [months, setMonths] = useState(6);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', months],
    queryFn: () => analyticsApi.getAnalytics(months),
  });

  const analytics = data?.data;

  const summaryCards = [
    {
      title: 'Total Income',
      value: analytics?.totalIncome ?? 0,
      icon: ArrowDownLeft,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-500',
      prefix: '+',
    },
    {
      title: 'Total Expenses',
      value: analytics?.totalExpenses ?? 0,
      icon: ArrowUpRight,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-500',
      prefix: '-',
    },
    {
      title: 'Net Flow',
      value: analytics?.netFlow ?? 0,
      icon: (analytics?.netFlow ?? 0) >= 0 ? TrendingUp : TrendingDown,
      color: 'from-indigo-500 to-violet-600',
      textColor: (analytics?.netFlow ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
      prefix: '',
    },
    {
      title: 'Avg Transaction',
      value: analytics?.averageTransactionAmount ?? 0,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-500',
      prefix: '',
    },
    {
      title: 'Total Transactions',
      value: analytics?.totalTransactions ?? 0,
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-500',
      isCurrency: false,
    },
    {
      title: 'Reward Points',
      value: analytics?.rewardPointsEarned ?? 0,
      icon: Award,
      color: 'from-fuchsia-500 to-purple-600',
      textColor: 'text-fuchsia-500',
      isCurrency: false,
      suffix: 'pts',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-xl">
          <p className="text-sm font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" /> Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Financial insights and spending trends</p>
        </div>
        <div className="flex gap-2">
          {[3, 6, 12].map((m) => (
            <Button
              key={m}
              size="sm"
              variant={months === m ? 'default' : 'outline'}
              onClick={() => setMonths(m)}
            >
              {m}M
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                  <card.icon className="h-3.5 w-3.5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${card.textColor ?? ''}`}>
                  {card.prefix && <span>{card.prefix}</span>}
                  {card.isCurrency === false
                    ? <>{card.value}{card.suffix ? ` ${card.suffix}` : ''}</>
                    : formatCurrency(card.value as number)}
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Trends Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={analytics?.monthlyTrends ?? []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="monthName" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={55}
                        strokeWidth={2}
                        className="stroke-card"
                      >
                        {analytics.categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 min-w-[180px]">
                    {analytics.categoryBreakdown.slice(0, 6).map((cat, index) => (
                      <div key={cat.category} className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[100px]">{cat.category}</span>
                        </div>
                        <span className="font-medium">{cat.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Daily Activity (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={(analytics?.dailyActivity ?? []).filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Recipients */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Top Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : analytics?.topRecipients && analytics.topRecipients.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRecipients.map((recipient, index) => (
                  <motion.div
                    key={recipient.email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-xl p-3 transition-all hover:bg-muted/50 border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold text-sm">
                        {recipient.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{recipient.name}</p>
                        <p className="text-xs text-muted-foreground">{recipient.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-500">-{formatCurrency(recipient.totalSent)}</p>
                      <p className="text-[10px] text-muted-foreground">{recipient.transferCount} transfer{recipient.transferCount !== 1 ? 's' : ''}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No transfer data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
