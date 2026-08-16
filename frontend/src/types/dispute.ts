export interface Dispute {
  id: string;
  transferId: string;
  transferReferenceId: string;
  transferAmount: number;
  counterpartyName: string;
  counterpartyEmail: string;
  reason: DisputeReason;
  status: DisputeStatus;
  description: string;
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export type DisputeReason =
  | 'UNAUTHORIZED'
  | 'WRONG_AMOUNT'
  | 'NOT_RECEIVED'
  | 'DUPLICATE'
  | 'FRAUD'
  | 'OTHER';

export interface DisputeRequest {
  transferId: string;
  reason: string;
  description: string;
}

export interface DisputeResolveRequest {
  status: string;
  resolutionNote: string;
}
