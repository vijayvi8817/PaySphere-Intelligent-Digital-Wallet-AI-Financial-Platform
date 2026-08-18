export type AuditAction = 
  | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' 
  | 'PROFILE_UPDATE' | 'EMAIL_VERIFIED' | 'OTP_GENERATED' | 'OTP_VERIFIED' 
  | 'TOKEN_REFRESHED' | 'SESSION_REVOKED' | 'CARD_ISSUED' | 'CARD_FROZEN' 
  | 'CARD_UNFROZEN' | 'CARD_LIMIT_UPDATED' | 'CARD_DETAILS_VIEWED' 
  | 'SAVINGS_GOAL_CREATED' | 'SAVINGS_DEPOSIT' | 'SAVINGS_WITHDRAWAL' 
  | 'TRANSFER_SENT' | 'HIGH_RISK_ALERT' | 'KYC_SUBMITTED';

export type AuditCategory = 'AUTH' | 'TRANSACTION' | 'SECURITY' | 'ADMIN' | 'CARD' | 'KYC';
export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent: string;
  details?: string;
  createdAt: string;
}
