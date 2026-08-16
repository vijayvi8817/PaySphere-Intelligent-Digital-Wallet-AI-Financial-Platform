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
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { AccountsPage } from '@/pages/accounts/AccountsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { RecurringPage } from '@/pages/recurring/RecurringPage';
import { QrPaymentPage } from '@/pages/qr/QrPaymentPage';
import { DisputesPage } from '@/pages/disputes/DisputesPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { KycVerificationPage } from '@/pages/kyc/KycVerificationPage';
import { AiInsightsPage } from '@/pages/ai/AiInsightsPage';
import { MultiCurrencyPage } from '@/pages/fx/MultiCurrencyPage';
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
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'recurring', element: <RecurringPage /> },
      { path: 'qr-payments', element: <QrPaymentPage /> },
      { path: 'disputes', element: <DisputesPage /> },
      { path: 'kyc', element: <KycVerificationPage /> },
      { path: 'ai-insights', element: <AiInsightsPage /> },
      { path: 'fx', element: <MultiCurrencyPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'team', element: <DashboardPage /> },
      { path: 'security', element: <SettingsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
