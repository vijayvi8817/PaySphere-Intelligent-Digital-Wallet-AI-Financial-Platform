export type TransferStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REVERSED';
export type TransferDirection = 'SENT' | 'RECEIVED';
export type BeneficiaryType = 'INTERNAL' | 'EXTERNAL';

export interface TransferRequest {
  recipientEmail: string;
  amount: number;
  note?: string;
  category?: string;
}

export interface Transfer {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  amount: number;
  fee: number;
  currency: string;
  status: TransferStatus;
  referenceId: string;
  note?: string;
  category?: string;
  senderBalanceBefore: number;
  senderBalanceAfter: number;
  receiverBalanceBefore: number;
  receiverBalanceAfter: number;
  direction: TransferDirection;
  completedAt?: string;
  createdAt: string;
}

export interface TransferSummary {
  totalSent: number;
  totalReceived: number;
  netFlow: number;
  totalTransferCount: number;
  sentCount: number;
  receivedCount: number;
  recentTransfers: Transfer[];
}

export interface BeneficiaryRequest {
  nickname: string;
  email: string;
  isFavorite?: boolean;
}

export interface Beneficiary {
  id: string;
  nickname: string;
  email: string;
  accountNumber?: string;
  type: BeneficiaryType;
  isFavorite: boolean;
  beneficiaryName?: string;
  createdAt: string;
}
