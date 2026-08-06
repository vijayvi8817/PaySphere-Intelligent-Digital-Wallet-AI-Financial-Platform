export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
  kycStatus: KycStatus;
  roles: string[];
  createdAt: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type AccountType = 'SAVINGS' | 'CURRENT' | 'WALLET';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';

export interface Account {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: Currency;
  status: AccountStatus;
  accountName?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  referenceId: string;
  description?: string;
  category?: string;
  fee: number;
  createdAt: string;
}
