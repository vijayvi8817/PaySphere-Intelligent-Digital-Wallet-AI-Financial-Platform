import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  CreditCard,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const summaryCards = [
  {
    title: 'Total Balance',
    value: '$24,563.00',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Monthly Income',
    value: '$8,350.00',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ArrowDownLeft,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Monthly Expenses',
    value: '$3,642.00',
    change: '-4.1%',
    trend: 'down' as const,
    icon: ArrowUpRight,
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Active Cards',
    value: '4',
    change: '+1 new',
    trend: 'up' as const,
    icon: CreditCard,
    color: 'from-violet-500 to-violet-600',
  },
];

const recentTransactions = [
  { name: 'Netflix Subscription', amount: -15.99, type: 'Entertainment', time: '2 min ago' },
  { name: 'Salary Deposit', amount: 5200.0, type: 'Income', time: '1 hour ago' },
  { name: 'Amazon Purchase', amount: -89.99, type: 'Shopping', time: '3 hours ago' },
  { name: 'Freelance Payment', amount: 1250.0, type: 'Income', time: '5 hours ago' },
  { name: 'Electricity Bill', amount: -120.0, type: 'Utilities', time: 'Yesterday' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {user?.firstName ?? 'User'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your financial activity
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp
                    className={`h-3 w-3 ${
                      card.trend === 'up' ? 'text-emerald-500' : 'text-red-500 rotate-180'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
              {/* Decorative gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.amount > 0
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
