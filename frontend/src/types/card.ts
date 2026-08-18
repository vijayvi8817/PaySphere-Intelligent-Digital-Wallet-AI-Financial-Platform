export type CardType = 'VIRTUAL' | 'PHYSICAL';
export type CardNetwork = 'VISA' | 'MASTERCARD';
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'CANCELLED';

export interface VirtualCard {
  id: string;
  userId: string;
  cardNumberMasked: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: CardType;
  cardNetwork: CardNetwork;
  dailyLimit: number;
  monthlyLimit: number;
  spentThisMonth: number;
  isFrozen: boolean;
  onlinePaymentsEnabled: boolean;
  internationalPaymentsEnabled: boolean;
  atmWithdrawalsEnabled: boolean;
  status: CardStatus;
  createdAt: string;
}

export interface CardSensitiveDetails {
  cardId: string;
  fullCardNumber: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
}

export interface IssueCardRequest {
  cardholderName: string;
  cardType: CardType;
  cardNetwork: CardNetwork;
  dailyLimit?: number;
  monthlyLimit?: number;
  pin?: string;
}
