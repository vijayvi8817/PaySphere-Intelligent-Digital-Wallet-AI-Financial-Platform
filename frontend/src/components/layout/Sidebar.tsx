import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Wallet2,
  BarChart3,
  Settings,
  CreditCard,
  Repeat,
  QrCode,
  FileWarning,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Globe,
  PiggyBank,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Wallet', icon: Wallet2, path: '/wallet' },
  { label: 'Savings Vaults', icon: PiggyBank, path: '/savings' },
  { label: 'Virtual Cards', icon: CreditCard, path: '/cards' },
  { label: 'Multi-Currency FX', icon: Globe, path: '/fx' },
  { label: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  { label: 'Accounts', icon: Wallet, path: '/accounts' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'QR Payments', icon: QrCode, path: '/qr-payments' },
  { label: 'AI Intelligence', icon: BrainCircuit, path: '/ai-insights' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Recurring', icon: Repeat, path: '/recurring' },
  { label: 'KYC Verification', icon: ShieldCheck, path: '/kyc' },
  { label: 'Disputes', icon: FileWarning, path: '/disputes' },
];

const bottomItems = [
  { label: 'Admin', icon: ShieldCheck, path: '/admin' },
  { label: 'Security Audit', icon: ShieldAlert, path: '/audit' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
      </div>

      <Separator />

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon className={cn('h-5 w-5 shrink-0 relative z-10', isActive && 'text-primary')} />
              {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom Nav */}
      <nav className="space-y-1 px-3 py-4">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full flex items-center justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
