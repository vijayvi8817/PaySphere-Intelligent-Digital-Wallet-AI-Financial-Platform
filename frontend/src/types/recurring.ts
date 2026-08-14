export type RecurringPaymentStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';
export type RecurringPaymentFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface RecurringPayment {
  id: string;
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency: string;
  frequency: RecurringPaymentFrequency;
  status: RecurringPaymentStatus;
  note?: string;
  category?: string;
  startDate: string;
  nextExecution: string;
  endDate?: string;
  lastExecuted?: string;
  totalExecuted: number;
  maxExecutions?: number;
  createdAt: string;
}

export interface RecurringPaymentRequest {
  recipientEmail: string;
  amount: number;
  frequency: string;
  note?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  maxExecutions?: number;
}
