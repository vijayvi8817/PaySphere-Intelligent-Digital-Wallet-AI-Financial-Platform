import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome to PaySphere
            </h1>
            <p className="text-lg text-indigo-100 max-w-md mx-auto leading-relaxed">
              The next-generation fintech platform for seamless payments, real-time analytics, and intelligent financial management.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">50M+</div>
                <div className="text-sm text-indigo-200 mt-1">Transactions</div>
              </div>
              <div>
                <div className="text-3xl font-bold">120+</div>
                <div className="text-sm text-indigo-200 mt-1">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm text-indigo-200 mt-1">Uptime</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex w-full lg:w-1/2 flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <ThemeToggle className="ml-auto" />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
