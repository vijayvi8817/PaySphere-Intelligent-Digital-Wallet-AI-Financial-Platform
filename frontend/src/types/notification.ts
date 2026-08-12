export type NotificationType =
  | 'TRANSFER_SENT'
  | 'TRANSFER_RECEIVED'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'WALLET_FROZEN'
  | 'WALLET_UNFROZEN'
  | 'ACCOUNT_LINKED'
  | 'ACCOUNT_VERIFIED'
  | 'PASSWORD_CHANGED'
  | 'PROFILE_UPDATED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceId?: string;
  createdAt: string;
}
