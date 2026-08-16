export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalTransfers: number;
  totalTransferVolume: number;
  totalDisputes: number;
  openDisputes: number;
  totalWallets: number;
  totalWalletBalance: number;
  newUsersThisMonth: number;
  transfersThisMonth: number;
  transferVolumeThisMonth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  kycStatus: string;
  roles: string[];
  walletBalance: number;
  totalTransfersSent: number;
  totalTransfersReceived: number;
  activeDisputes: number;
  createdAt: string;
  lastLogin?: string;
}
