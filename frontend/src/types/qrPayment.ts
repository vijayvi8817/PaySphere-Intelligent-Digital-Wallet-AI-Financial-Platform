export interface QrPaymentToken {
  id: string;
  token: string;
  qrContent: string;
  amount?: number;
  note?: string;
  singleUse: boolean;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  recipientName: string;
  recipientEmail: string;
}

export interface QrPaymentRequest {
  amount?: number;
  note?: string;
  singleUse?: boolean;
  expiryMinutes?: number;
}

export interface QrPayRequest {
  token: string;
  amount?: number;
  note?: string;
}
