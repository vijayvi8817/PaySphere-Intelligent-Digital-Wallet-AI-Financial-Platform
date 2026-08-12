import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { WalletPage } from '@/pages/wallet/WalletPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'accounts', element: <DashboardPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'analytics', element: <DashboardPage /> },
      { path: 'team', element: <DashboardPage /> },
      { path: 'security', element: <DashboardPage /> },
      { path: 'settings', element: <DashboardPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
