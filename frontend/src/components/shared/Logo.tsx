import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-indigo-500/25">
        <Wallet className="h-5 w-5 text-white" />
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 blur transition-opacity group-hover:opacity-30" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">
            Pay<span className="gradient-text">Sphere</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Fintech Platform
          </span>
        </div>
      )}
    </div>
  );
}
