import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Wallet2,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  Users,
  Repeat,
  X,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Wallet', icon: Wallet2, path: '/wallet' },
  { label: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  { label: 'Accounts', icon: Wallet, path: '/accounts' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Recurring', icon: Repeat, path: '/recurring' },
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Security', icon: Shield, path: '/security' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r animate-slide-in-left">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Separator />
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
