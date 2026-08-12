import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet';
import type { WalletDepositRequest, WalletWithdrawRequest } from '@/types/wallet';
import toast from 'react-hot-toast';

const WALLET_KEYS = {
  all: ['wallet'] as const,
  wallet: () => [...WALLET_KEYS.all, 'detail'] as const,
  dashboard: () => [...WALLET_KEYS.all, 'dashboard'] as const,
  transactions: (page: number, size: number, type?: string) =>
    [...WALLET_KEYS.all, 'transactions', { page, size, type }] as const,
  statement: (month: number, year: number) =>
    [...WALLET_KEYS.all, 'statement', { month, year }] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: WALLET_KEYS.wallet(),
    queryFn: async () => {
      const result = await walletApi.getWallet();
      return result.data;
    },
  });
}

export function useWalletDashboard() {
  return useQuery({
    queryKey: WALLET_KEYS.dashboard(),
    queryFn: async () => {
      const result = await walletApi.getDashboard();
      return result.data;
    },
  });
}

export function useWalletTransactions(page = 0, size = 20, type?: string) {
  return useQuery({
    queryKey: WALLET_KEYS.transactions(page, size, type),
    queryFn: async () => {
      const result = await walletApi.getTransactions(page, size, type);
      return result.data;
    },
  });
}

export function useWalletStatement(month: number, year: number) {
  return useQuery({
    queryKey: WALLET_KEYS.statement(month, year),
    queryFn: async () => {
      const result = await walletApi.getStatement(month, year);
      return result.data;
    },
    enabled: month > 0 && year > 0,
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletDepositRequest) => walletApi.deposit(data),
    onSuccess: (result) => {
      toast.success(result.message || 'Deposit successful!');
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Deposit failed';
      toast.error(message);
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletWithdrawRequest) => walletApi.withdraw(data),
    onSuccess: (result) => {
      toast.success(result.message || 'Withdrawal successful!');
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Withdrawal failed';
      toast.error(message);
    },
  });
}

export function useFreezeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => walletApi.freezeWallet(),
    onSuccess: (result) => {
      toast.success(result.message || 'Wallet frozen');
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to freeze wallet';
      toast.error(message);
    },
  });
}

export function useUnfreezeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => walletApi.unfreezeWallet(),
    onSuccess: (result) => {
      toast.success(result.message || 'Wallet unfrozen');
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to unfreeze wallet';
      toast.error(message);
    },
  });
}
