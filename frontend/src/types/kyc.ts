export type DocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'UTILITY_BILL';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface KycSubmissionRequest {
  documentType: DocumentType;
  documentNumber: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
}

export interface KycReviewRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface KycDocumentResponse {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  documentType: DocumentType;
  documentNumber: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}
