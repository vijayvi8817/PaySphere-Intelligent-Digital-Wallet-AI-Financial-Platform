export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type WalletTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'REWARD';

export interface Wallet {
  id: string;
  walletNumber: string;
  balance: number;
  rewardPoints: number;
  currency: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  status: string;
  referenceId: string;
  description?: string;
  category?: string;
  rewardPoints: number;
  createdAt: string;
}

export interface WalletDepositRequest {
  amount: number;
  description?: string;
  category?: string;
}

export interface WalletWithdrawRequest {
  amount: number;
  description?: string;
  category?: string;
}

export interface MonthlyBalanceSummary {
  month: number;
  year: number;
  monthName: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

export interface WalletDashboard {
  wallet: Wallet;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  depositCount: number;
  withdrawalCount: number;
  recentTransactions: WalletTransaction[];
  monthlyBalances: MonthlyBalanceSummary[];
}

export interface WalletStatement {
  walletNumber: string;
  ownerName: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  transactions: WalletTransaction[];
}
