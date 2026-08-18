import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Plus,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Trash2,
  Zap,
  Target,
  DollarSign,
  Palmtree,
  Laptop,
  Car,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { getSavingsSummary, createSavingsGoal, depositToSavingsGoal, withdrawFromSavingsGoal, toggleAutoRoundup, deleteSavingsGoal } from '@/api/savings';
import { SavingsSummary, SavingsGoal, GoalCategory } from '@/types/savings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CATEGORY_ICONS: Record<GoalCategory, any> = {
  EMERGENCY_FUND: ShieldAlert,
  VACATION: Palmtree,
  TECH: Laptop,
  VEHICLE: Car,
  HOUSE: Home,
  CUSTOM: PiggyBank,
};

const COLOR_OPTIONS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-amber-500',
];

export function SavingsGoalsPage() {
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [withdrawGoal, setWithdrawGoal] = useState<SavingsGoal | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state for creating goal
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('CUSTOM');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isAutoRoundupEnabled, setIsAutoRoundupEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState('bg-emerald-500');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await getSavingsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load savings summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    try {
      setSubmitting(true);
      await createSavingsGoal({
        name,
        category,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate || undefined,
        isAutoRoundupEnabled,
        color: selectedColor,
      });
      setIsCreateOpen(false);
      resetForm();
      fetchSummary();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('CUSTOM');
    setTargetAmount('');
    setTargetDate('');
    setIsAutoRoundupEnabled(false);
    setSelectedColor('bg-emerald-500');
  };

  const handleDeposit = async () => {
    if (!depositGoal || !actionAmount) return;
    try {
      setSubmitting(true);
      await depositToSavingsGoal(depositGoal.id, parseFloat(actionAmount));
      setDepositGoal(null);
      setActionAmount('');
      fetchSummary();
    } catch (err) {
      console.error('Failed to deposit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawGoal || !actionAmount) return;
    try {
      setSubmitting(true);
      await withdrawFromSavingsGoal(withdrawGoal.id, parseFloat(actionAmount));
      setWithdrawGoal(null);
      setActionAmount('');
      fetchSummary();
    } catch (err) {
      console.error('Failed to withdraw:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRoundup = async (goalId: string) => {
    try {
      await toggleAutoRoundup(goalId);
      fetchSummary();
    } catch (err) {
      console.error('Failed to toggle roundup:', err);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this vault? Remaining funds will be returned to your main wallet.')) return;
    try {
      await deleteSavingsGoal(goalId);
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Vaults & Micro-Investments</h1>
          <p className="text-muted-foreground mt-1">
            Grow your wealth with automated round-ups and smart savings target goals.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500">
              <Plus className="h-4 w-4" /> Create Savings Vault
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-emerald-500" /> Create New Savings Vault
              </DialogTitle>
              <DialogDescription>
                Set a financial goal, enable auto-roundups, and watch your savings grow automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Vault Name</Label>
                <Input placeholder="e.g. Dream Summer Vacation" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                >
                  <option value="CUSTOM">Custom Goal</option>
                  <option value="EMERGENCY_FUND">Emergency Fund</option>
                  <option value="VACATION">Vacation & Travel</option>
                  <option value="TECH">Gadgets & Tech</option>
                  <option value="VEHICLE">Car / Vehicle</option>
                  <option value="HOUSE">House / Real Estate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Amount ($)</Label>
                  <Input type="number" step="0.01" placeholder="2500.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Target Date (Optional)</Label>
                  <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vault Accent Color</Label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`h-8 w-8 rounded-full ${col} transition-all ${selectedColor === col ? 'ring-2 ring-foreground ring-offset-2 scale-110' : 'opacity-70'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Zap className="h-4 w-4 text-amber-500" /> Enable Auto Round-Up
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically round up card payments and send spare change to this vault.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoRoundupEnabled}
                  onChange={(e) => setIsAutoRoundupEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-primary text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-500">
                  {submitting ? 'Creating...' : 'Create Vault'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${summary?.totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all active savings vaults</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Target</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined total goals target</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Vaults</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeGoalsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Savings targets in progress</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-background to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spare Change Round-Up</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={summary?.isRoundupActive ? 'default' : 'secondary'} className={summary?.isRoundupActive ? 'bg-amber-500 text-white' : ''}>
                {summary?.isRoundupActive ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary?.isRoundupActive ? 'Spare change auto-depositing' : 'Enable round-up on any goal'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Active Savings Goals
        </h2>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your savings vaults...</div>
        ) : !summary?.goals || summary.goals.length === 0 ? (
          <Card className="p-12 text-center">
            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No Savings Vaults Created Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-6">
              Create your first savings goal or activate micro-investment round-ups to build your emergency fund or dream purchase.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create First Vault
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {summary.goals.map((goal) => {
              const Icon = CATEGORY_ICONS[goal.category] || PiggyBank;
              return (
                <motion.div key={goal.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Card className="relative overflow-hidden border transition-all hover:shadow-lg">
                    {/* Color top accent bar */}
                    <div className={`h-2.5 w-full ${goal.color}`} />

                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${goal.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                          <CardDescription className="text-xs capitalize">{goal.category.replace('_', ' ').toLowerCase()}</CardDescription>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Amount progress display */}
                      <div className="flex justify-between items-baseline">
                        <div className="text-2xl font-bold">
                          ${goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          target of ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{goal.progressPercentage}%</span>
                        </div>
                        <Progress value={goal.progressPercentage} className="h-2.5" />
                      </div>

                      {/* Round-up & Target Date info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t text-xs">
                        <button
                          onClick={() => handleToggleRoundup(goal.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-colors ${
                            goal.isAutoRoundupEnabled ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Zap className="h-3.5 w-3.5" />
                          {goal.isAutoRoundupEnabled ? 'Auto Round-Up ON' : 'Turn ON Round-Up'}
                        </button>

                        {goal.targetDate && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositGoal(goal)}
                          className="w-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Deposit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawGoal(goal)}
                          className="w-full text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Withdraw
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Dialog open={!!depositGoal} onOpenChange={(open: boolean) => !open && setDepositGoal(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deposit into {depositGoal?.name}</DialogTitle>
            <DialogDescription>Transfer money from your primary wallet to this savings vault.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Deposit Amount ($)</Label>
              <Input type="number" step="0.01" placeholder="50.00" value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDepositGoal(null)}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={submitting || !actionAmount} className="bg-emerald-600 text-white hover:bg-emerald-500">
                Confirm Deposit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={!!withdrawGoal} onOpenChange={(open: boolean) => !open && setWithdrawGoal(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Withdraw from {withdrawGoal?.name}</DialogTitle>
            <DialogDescription>Transfer money back from this vault into your primary wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Withdrawal Amount ($)</Label>
              <Input type="number" step="0.01" placeholder="50.00" value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWithdrawGoal(null)}>Cancel</Button>
              <Button onClick={handleWithdraw} disabled={submitting || !actionAmount} className="bg-blue-600 text-white hover:bg-blue-500">
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
