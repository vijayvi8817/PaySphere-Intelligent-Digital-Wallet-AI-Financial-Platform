export interface MonthlyTrend {
  month: number;
  year: number;
  monthName: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface TopRecipient {
  name: string;
  email: string;
  totalSent: number;
  transferCount: number;
}

export interface DailyActivity {
  date: string;
  income: number;
  expenses: number;
  count: number;
}

export interface Analytics {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  rewardPointsEarned: number;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  topRecipients: TopRecipient[];
  dailyActivity: DailyActivity[];
}
