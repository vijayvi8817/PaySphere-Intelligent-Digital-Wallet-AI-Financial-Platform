export type LinkedAccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS';
export type LinkedAccountStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'REMOVED';

export interface LinkedAccount {
  id: string;
  accountName: string;
  bankName: string;
  maskedAccountNumber: string;
  routingNumber?: string;
  accountType: LinkedAccountType;
  status: LinkedAccountStatus;
  primary: boolean;
  createdAt: string;
}

export interface LinkedAccountRequest {
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType?: string;
  isPrimary?: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}
